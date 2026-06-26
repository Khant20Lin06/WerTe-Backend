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
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemDto, toMenuItemDto } from '../dto/menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenusRepository } from '../repositories/menus.repository';

@Injectable()
export class MenuItemInventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menusRepository: MenusRepository,
    private readonly auditService: AuditService,
    private readonly notificationEventService: NotificationEventService,
  ) {}

  async adjustBranchItemInventory(
    currentUser: AuthenticatedUserEntity,
    item: MenuItemOwnershipRecord,
    payload: AdjustInventoryDto,
  ): Promise<MenuItemDto> {
    this.assertStockTrackingEnabled(item.isStockTracked);
    await this.assertItemDoesNotUseLots(item.id);
    const normalizedReasonCode = this.requireReasonCode(payload.reasonCode);
    const normalizedNote = this.normalizeOptionalString(payload.note);

    const updatedItem = await this.prisma.runInTransaction(async (tx) => {
      const adjusted = await this.menusRepository.adjustTrackedItemStock(
        item.id,
        payload.delta,
        tx,
      );

      if (!adjusted) {
        throw new AppException(
          'The requested inventory adjustment would make the stock quantity invalid.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              itemId: item.id,
              requestedDelta: payload.delta,
              currentStockQuantity: item.stockQuantity ?? 0,
            },
          },
        );
      }

      return this.menusRepository.findItemById(item.id, tx);
    });

    if (updatedItem === null) {
      throw new AppException(
        'Adjusted menu item could not be reloaded.',
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
      action: 'menu_items.inventory_adjusted',
      resourceType: AuditResourceType.MENU_ITEM,
      resourceId: updatedItem.id,
      resourceLabel: updatedItem.name,
      branchId: updatedItem.branch.id,
      metadataJson: {
        delta: payload.delta,
        reasonCode: normalizedReasonCode,
        note: normalizedNote,
        beforeStockQuantity: item.stockQuantity,
        afterStockQuantity: updatedItem.stockQuantity,
        lowStockThreshold: updatedItem.lowStockThreshold,
      },
    });

    await this.publishInventoryAlertIfNeeded(item, updatedItem);

    return toMenuItemDto(updatedItem);
  }

  normalizeCreateInventory(
    payload: CreateMenuItemDto,
  ): Pick<
    Prisma.MenuItemUncheckedCreateInput,
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

  normalizeUpdateInventory(
    payload: UpdateMenuItemDto,
    item: MenuItemOwnershipRecord,
  ): Pick<
    Prisma.MenuItemUpdateInput,
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
        item.isStockTracked);

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
        : item.isStockTracked
          ? {}
          : { stockQuantity: 0 }),
      ...(payload.lowStockThreshold !== undefined
        ? { lowStockThreshold: payload.lowStockThreshold }
        : {}),
    };
  }

  resolveNextItemStockTracking(
    payload: UpdateMenuItemDto,
    item: MenuItemOwnershipRecord,
  ): boolean {
    return (
      payload.isStockTracked ??
      (payload.stockQuantity !== undefined ||
        payload.lowStockThreshold !== undefined ||
        item.isStockTracked)
    );
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

  private async assertItemDoesNotUseLots(itemId: string): Promise<void> {
    const lotCount =
      await this.menusRepository.countItemInventoryLotsByMenuItemId(itemId);

    if (lotCount === 0) {
      return;
    }

    throw new AppException(
      'Direct item-level inventory adjustments are disabled once inventory lots exist. Adjust the relevant lot instead.',
      HttpStatus.CONFLICT,
      {
        code: ErrorCodes.conflict,
        details: {
          itemId,
          lotCount,
        },
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
    previousItem: MenuItemOwnershipRecord,
    nextItem: MenuItemOwnershipRecord,
  ): Promise<void> {
    const previousAttentionLevel = this.resolveInventoryAttentionLevel(previousItem);
    const nextAttentionLevel = this.resolveInventoryAttentionLevel(nextItem);

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
      merchantUserId: nextItem.branch.merchant.user.id,
      branchId: nextItem.branch.id,
      branchName: null,
      resourceType: 'MENU_ITEM',
      resourceId: nextItem.id,
      resourceLabel: nextItem.name,
      attentionLevel: nextAttentionLevel,
      stockQuantity: nextItem.stockQuantity ?? null,
      lowStockThreshold: nextItem.lowStockThreshold ?? null,
    });
  }

  private resolveInventoryAttentionLevel(
    item: MenuItemOwnershipRecord,
  ): 'LOW_STOCK' | 'OUT_OF_STOCK' | null {
    if (!item.isStockTracked) {
      return null;
    }

    if ((item.stockQuantity ?? 0) <= 0) {
      return 'OUT_OF_STOCK';
    }

    if (
      item.lowStockThreshold !== null &&
      item.lowStockThreshold !== undefined &&
      item.stockQuantity !== null &&
      item.stockQuantity <= item.lowStockThreshold
    ) {
      return 'LOW_STOCK';
    }

    return null;
  }
}
