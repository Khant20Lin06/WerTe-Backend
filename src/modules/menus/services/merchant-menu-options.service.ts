import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  Prisma,
} from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { NotificationEventService } from '../../notifications/services/notification-event.service';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateItemOptionDto } from '../dto/create-item-option.dto';
import { ItemOptionDto, toItemOptionDto } from '../dto/item-option.dto';
import { UpdateItemOptionDto } from '../dto/update-item-option.dto';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
import { MenuOptionPolicyService } from '../policies/menu-option-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantMenuOptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menusService: MenusService,
    private readonly menusRepository: MenusRepository,
    private readonly menuOptionPolicyService: MenuOptionPolicyService,
    private readonly auditService: AuditService,
    private readonly notificationEventService: NotificationEventService,
    private readonly menuCache: MenuCacheService,
  ) {}

  async listGroupOptions(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
  ): Promise<ItemOptionDto[]> {
    const optionGroup = await this.resolveOwnedOptionGroup(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
    );
    const options = await this.menusService.listOptionsByOptionGroupId(optionGroup.id);

    return options.map((option) => toItemOptionDto(option));
  }

  async getGroupOption(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    optionId: string,
  ): Promise<ItemOptionDto> {
    const option = await this.resolveOwnedOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
    );

    return toItemOptionDto(option);
  }

  async createGroupOption(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    payload: CreateItemOptionDto,
  ): Promise<ItemOptionDto> {
    const optionGroup = await this.resolveOwnedOptionGroup(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
    );

    const option = await this.prisma.runInTransaction(async (tx) => {
      const nextSortOrder =
        payload.sortOrder ??
        ((await this.menusRepository.findHighestOptionSortOrderByOptionGroupId(
          optionGroup.id,
          tx,
        ))?.sortOrder ?? -1) + 1;

      return this.menusRepository.createOption(
        {
          groupId: optionGroup.id,
          name: payload.name,
          priceDelta: payload.priceDelta,
          ...this.normalizeCreateInventory(payload),
          sortOrder: nextSortOrder,
          isActive: payload.isActive ?? true,
        },
        tx,
      );
    });

    void this.menuCache.invalidate(branchId);

    return toItemOptionDto(option);
  }

  async updateGroupOption(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    optionId: string,
    payload: UpdateItemOptionDto,
  ): Promise<ItemOptionDto> {
    const option = await this.resolveOwnedOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
    );

    const updatedOption = await this.menusRepository.updateOption(option.id, {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.priceDelta !== undefined
        ? { priceDelta: payload.priceDelta }
        : {}),
      ...this.normalizeUpdateInventory(payload, option),
      ...(payload.sortOrder !== undefined
        ? { sortOrder: payload.sortOrder }
        : {}),
      ...(payload.isActive !== undefined
        ? { isActive: payload.isActive }
        : {}),
    });

    void this.menuCache.invalidate(branchId);

    return toItemOptionDto(updatedOption);
  }

  async adjustGroupOptionInventory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    optionId: string,
    payload: AdjustInventoryDto,
  ): Promise<ItemOptionDto> {
    const option = await this.resolveOwnedOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
    );
    this.assertStockTrackingEnabled(option.isStockTracked);
    const normalizedReasonCode = this.requireReasonCode(payload.reasonCode);
    const normalizedNote = this.normalizeOptionalString(payload.note);

    const updatedOption = await this.prisma.runInTransaction(async (tx) => {
      const adjusted = await this.menusRepository.adjustTrackedOptionStock(
        option.id,
        payload.delta,
        tx,
      );

      if (!adjusted) {
        throw new AppException(
          'The requested inventory adjustment would make the option stock quantity invalid.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              optionId: option.id,
              requestedDelta: payload.delta,
              currentStockQuantity: option.stockQuantity ?? 0,
            },
          },
        );
      }

      return this.menusRepository.findOptionById(option.id, tx);
    });

    if (updatedOption === null) {
      throw new AppException(
        'Adjusted menu option could not be reloaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'item_options.inventory_adjusted',
      resourceType: AuditResourceType.ITEM_OPTION,
      resourceId: updatedOption.id,
      resourceLabel: updatedOption.name,
      branchId: updatedOption.group.menuItem.branch.id,
      metadataJson: {
        delta: payload.delta,
        reasonCode: normalizedReasonCode,
        note: normalizedNote,
        beforeStockQuantity: option.stockQuantity,
        afterStockQuantity: updatedOption.stockQuantity,
        lowStockThreshold: updatedOption.lowStockThreshold,
      },
    });

    await this.publishInventoryAlertIfNeeded(option, updatedOption);

    void this.menuCache.invalidate(branchId);

    return toItemOptionDto(updatedOption);
  }

  private normalizeCreateInventory(
    payload: CreateItemOptionDto,
  ): Pick<
    Prisma.ItemOptionUncheckedCreateInput,
    'isStockTracked' | 'stockQuantity' | 'lowStockThreshold'
  > {
    const hasInventoryFields =
      payload.stockQuantity !== undefined ||
      payload.lowStockThreshold !== undefined;
    const isStockTracked = payload.isStockTracked ?? hasInventoryFields;

    this.assertInventoryValue('stockQuantity', payload.stockQuantity);
    this.assertInventoryValue('lowStockThreshold', payload.lowStockThreshold);

    if (!isStockTracked) {
      return {
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
      };
    }

    return {
      isStockTracked: true,
      stockQuantity: payload.stockQuantity ?? 0,
      lowStockThreshold: payload.lowStockThreshold ?? null,
    };
  }

  private normalizeUpdateInventory(
    payload: UpdateItemOptionDto,
    option: ItemOptionOwnershipRecord,
  ): Pick<
    Prisma.ItemOptionUpdateInput,
    'isStockTracked' | 'stockQuantity' | 'lowStockThreshold'
  > {
    const hasInventoryFields =
      payload.isStockTracked !== undefined ||
      payload.stockQuantity !== undefined ||
      payload.lowStockThreshold !== undefined;

    if (!hasInventoryFields) {
      return {};
    }

    this.assertInventoryValue('stockQuantity', payload.stockQuantity);
    this.assertInventoryValue('lowStockThreshold', payload.lowStockThreshold);

    const isStockTracked =
      payload.isStockTracked ??
      (payload.stockQuantity !== undefined ||
        payload.lowStockThreshold !== undefined ||
        option.isStockTracked);

    if (!isStockTracked) {
      return {
        isStockTracked: false,
        stockQuantity: null,
        lowStockThreshold: null,
      };
    }

    return {
      isStockTracked: true,
      ...(payload.stockQuantity !== undefined
        ? { stockQuantity: payload.stockQuantity }
        : option.isStockTracked
          ? {}
          : { stockQuantity: 0 }),
      ...(payload.lowStockThreshold !== undefined
        ? { lowStockThreshold: payload.lowStockThreshold }
        : {}),
    };
  }

  async deleteGroupOption(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    optionId: string,
  ): Promise<void> {
    const option = await this.resolveOwnedOption(
      currentUser,
      branchId,
      itemId,
      optionGroupId,
      optionId,
    );
    await this.menusRepository.deleteOption(option.id);
    void this.menuCache.invalidate(branchId);
  }

  private async resolveOwnedOptionGroup(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
  ): Promise<ItemOptionGroupOwnershipRecord> {
    const optionGroup = await this.menusService.findOptionGroupOwnedByUserId(
      currentUser.userId,
      optionGroupId,
    );

    if (
      optionGroup === null ||
      optionGroup.menuItem.branch.id !== branchId ||
      optionGroup.menuItem.id !== itemId
    ) {
      throw new AppException(
        'Item option group was not found for the requested menu item.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (
      !this.menuOptionPolicyService.canManageOptionGroup(currentUser, optionGroup)
    ) {
      throw new AppException(
        'You are not allowed to manage options for this option group.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return optionGroup;
  }

  private async resolveOwnedOption(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    optionGroupId: string,
    optionId: string,
  ): Promise<ItemOptionOwnershipRecord> {
    const option = await this.menusService.findOptionOwnedByUserId(
      currentUser.userId,
      optionId,
    );

    if (
      option === null ||
      option.group.menuItem.branch.id !== branchId ||
      option.group.menuItem.id !== itemId ||
      option.group.id !== optionGroupId
    ) {
      throw new AppException(
        'Item option was not found for the requested option group.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (!this.menuOptionPolicyService.canManageOption(currentUser, option)) {
      throw new AppException(
        'You are not allowed to manage this option.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return option;
  }

  private assertInventoryValue(name: string, value?: number): void {
    if (value === undefined) {
      return;
    }

    if (!Number.isInteger(value) || value < 0) {
      throw new AppException(
        `${name} must be a whole number greater than or equal to zero.`,
        HttpStatus.BAD_REQUEST,
        {
          code: ErrorCodes.validationFailed,
        },
      );
    }
  }

  private assertStockTrackingEnabled(isStockTracked: boolean): void {
    if (isStockTracked) {
      return;
    }

    throw new AppException(
      'Inventory adjustments require stock tracking to be enabled.',
      HttpStatus.CONFLICT,
      {
        code: ErrorCodes.conflict,
      },
    );
  }

  private requireReasonCode(reasonCode: string): string {
    const normalizedReasonCode = this.normalizeOptionalString(reasonCode);

    if (normalizedReasonCode === null) {
      throw new AppException(
        'A reason code is required for inventory adjustments.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
        },
      );
    }

    return normalizedReasonCode;
  }

  private normalizeOptionalString(value: string | undefined | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? null : normalized;
  }

  private async publishInventoryAlertIfNeeded(
    previousOption: ItemOptionOwnershipRecord,
    nextOption: ItemOptionOwnershipRecord,
  ): Promise<void> {
    const previousAttentionLevel = this.resolveInventoryAttentionLevel(previousOption);
    const nextAttentionLevel = this.resolveInventoryAttentionLevel(nextOption);

    if (nextAttentionLevel === null) {
      return;
    }

    const shouldNotify =
      previousAttentionLevel === null ||
      (previousAttentionLevel === 'LOW_STOCK' &&
        nextAttentionLevel === 'OUT_OF_STOCK');

    if (!shouldNotify) {
      return;
    }

    await this.notificationEventService.publishMerchantInventoryAlert({
      merchantUserId: nextOption.group.menuItem.branch.merchant.user.id,
      branchId: nextOption.group.menuItem.branch.id,
      branchName: null,
      resourceType: 'ITEM_OPTION',
      resourceId: nextOption.id,
      resourceLabel: nextOption.name,
      attentionLevel: nextAttentionLevel,
      stockQuantity: nextOption.stockQuantity ?? null,
      lowStockThreshold: nextOption.lowStockThreshold ?? null,
      menuItemName: nextOption.group.menuItem.name,
    });
  }

  private resolveInventoryAttentionLevel(
    option: ItemOptionOwnershipRecord,
  ): 'LOW_STOCK' | 'OUT_OF_STOCK' | null {
    if (!option.isStockTracked) {
      return null;
    }

    if ((option.stockQuantity ?? 0) <= 0) {
      return 'OUT_OF_STOCK';
    }

    if (
      option.lowStockThreshold !== null &&
      option.lowStockThreshold !== undefined &&
      option.stockQuantity !== null &&
      option.stockQuantity <= option.lowStockThreshold
    ) {
      return 'LOW_STOCK';
    }

    return null;
  }
}
