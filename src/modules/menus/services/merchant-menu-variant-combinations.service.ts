import { HttpStatus, Injectable } from '@nestjs/common';
import { ItemOptionGroupKind, Prisma } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CreateItemVariantCombinationDto } from '../dto/create-item-variant-combination.dto';
import {
  ItemVariantCombinationDto,
  toItemVariantCombinationDto,
} from '../dto/item-variant-combination.dto';
import { UpdateItemVariantCombinationDto } from '../dto/update-item-variant-combination.dto';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
import { ItemVariantCombinationOwnershipRecord } from '../entities/item-variant-combination-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenuItemPolicyService } from '../policies/menu-item-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import {
  buildVariantCombinationDefaultName,
  buildVariantCombinationSignature,
} from '../utils/item-variant-combination.util';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantMenuVariantCombinationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menusService: MenusService,
    private readonly menusRepository: MenusRepository,
    private readonly menuItemPolicyService: MenuItemPolicyService,
    private readonly menuCache: MenuCacheService,
  ) {}

  async listItemVariantCombinations(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<ItemVariantCombinationDto[]> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const combinations =
      await this.menusService.listVariantCombinationsByMenuItemId(item.id);

    return combinations.map((combination) => toItemVariantCombinationDto(combination));
  }

  async getItemVariantCombination(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    combinationId: string,
  ): Promise<ItemVariantCombinationDto> {
    const combination = await this.resolveOwnedVariantCombination(
      currentUser,
      branchId,
      itemId,
      combinationId,
    );

    return toItemVariantCombinationDto(combination);
  }

  async createItemVariantCombination(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    payload: CreateItemVariantCombinationDto,
  ): Promise<ItemVariantCombinationDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const selection = await this.resolveVariantSelection(item.id, payload.selectedOptionIds);
    const existing =
      await this.menusRepository.findVariantCombinationByMenuItemIdAndSignature(
        item.id,
        selection.signature,
      );

    if (existing !== null) {
      throw new AppException(
        'A variant combination with the same selected options already exists for this menu item.',
        HttpStatus.CONFLICT,
        {
          code: ErrorCodes.conflict,
          details: {
            menuItemId: item.id,
            existingCombinationId: existing.id,
          },
        },
      );
    }

    const combination = await this.prisma.runInTransaction(async (tx) => {
      const nextSortOrder =
        payload.sortOrder ??
        ((await this.menusRepository.findHighestVariantCombinationSortOrderByMenuItemId(
          item.id,
          tx,
        ))?.sortOrder ?? -1) + 1;
      const created = await this.menusRepository.createVariantCombination(
        {
          menuItemId: item.id,
          name:
            this.normalizeOptionalString(payload.name) ?? selection.defaultName,
          sku: this.normalizeOptionalString(payload.sku),
          signature: selection.signature,
          ...this.normalizeCreateInventory(payload),
          sortOrder: nextSortOrder,
          isActive: payload.isActive ?? true,
        },
        tx,
      );

      await this.menusRepository.replaceVariantCombinationOptions(
        created.id,
        selection.selectedOptions.map((selectedOption) => selectedOption.id),
        tx,
      );

      return this.menusRepository.findVariantCombinationById(created.id, tx);
    });

    if (combination === null) {
      throw new AppException(
        'Created variant combination could not be reloaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    void this.menuCache.invalidate(branchId);

    return toItemVariantCombinationDto(combination);
  }

  async updateItemVariantCombination(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    combinationId: string,
    payload: UpdateItemVariantCombinationDto,
  ): Promise<ItemVariantCombinationDto> {
    const combination = await this.resolveOwnedVariantCombination(
      currentUser,
      branchId,
      itemId,
      combinationId,
    );

    const selection =
      payload.selectedOptionIds !== undefined
        ? await this.resolveVariantSelection(
            combination.menuItem.id,
            payload.selectedOptionIds,
          )
        : null;

    if (selection !== null) {
      const existing =
        await this.menusRepository.findVariantCombinationByMenuItemIdAndSignature(
          combination.menuItem.id,
          selection.signature,
        );

      if (existing !== null && existing.id !== combination.id) {
        throw new AppException(
          'A variant combination with the same selected options already exists for this menu item.',
          HttpStatus.CONFLICT,
          {
            code: ErrorCodes.conflict,
            details: {
              menuItemId: combination.menuItem.id,
              existingCombinationId: existing.id,
            },
          },
        );
      }
    }

    const updated = await this.prisma.runInTransaction(async (tx) => {
      await this.menusRepository.updateVariantCombination(
        combination.id,
        {
          ...(selection !== null ? { signature: selection.signature } : {}),
          ...(payload.name !== undefined
            ? {
                name:
                  this.normalizeOptionalString(payload.name) ?? combination.name,
              }
            : selection !== null
              ? { name: selection.defaultName }
              : {}),
          ...(payload.sku !== undefined
            ? { sku: this.normalizeOptionalString(payload.sku) }
            : {}),
          ...this.normalizeUpdateInventory(payload, combination),
          ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
          ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        },
        tx,
      );

      if (selection !== null) {
        await this.menusRepository.replaceVariantCombinationOptions(
          combination.id,
          selection.selectedOptions.map((selectedOption) => selectedOption.id),
          tx,
        );
      }

      return this.menusRepository.findVariantCombinationById(combination.id, tx);
    });

    if (updated === null) {
      throw new AppException(
        'Updated variant combination could not be reloaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    void this.menuCache.invalidate(branchId);

    return toItemVariantCombinationDto(updated);
  }

  private async resolveOwnedItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<MenuItemOwnershipRecord> {
    const item = await this.menusService.findItemOwnedByUserId(
      currentUser.userId,
      itemId,
    );

    if (item === null || item.branch.id !== branchId) {
      throw new AppException(
        'Menu item was not found for the requested branch.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (!this.menuItemPolicyService.canManageItem(currentUser, item)) {
      throw new AppException(
        'You are not allowed to manage variant combinations for this menu item.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return item;
  }

  private async resolveOwnedVariantCombination(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    combinationId: string,
  ): Promise<ItemVariantCombinationOwnershipRecord> {
    const combination = await this.menusService.findVariantCombinationById(
      combinationId,
    );

    if (
      combination === null ||
      combination.menuItem.branch.id !== branchId ||
      combination.menuItem.id !== itemId
    ) {
      throw new AppException(
        'Variant combination was not found for the requested menu item.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (combination.menuItem.branch.merchant.user.id !== currentUser.userId) {
      throw new AppException(
        'You are not allowed to manage this variant combination.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return combination;
  }

  private async resolveVariantSelection(menuItemId: string, selectedOptionIds: string[]) {
    this.assertSelectedOptionIdsAreUnique(selectedOptionIds);

    const variantGroups = (
      await this.menusService.listOptionGroupsByMenuItemId(menuItemId)
    ).filter(
      (group) => group.isActive && group.kind === ItemOptionGroupKind.VARIANT_SELECTOR,
    );

    if (variantGroups.length === 0) {
      throw new AppException(
        'Variant combinations require at least one active variant selector option group.',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            menuItemId,
          },
        },
      );
    }

    const optionMap = new Map<string, ItemOptionOwnershipRecord>();

    for (const group of variantGroups) {
      const options = await this.menusService.listOptionsByOptionGroupId(group.id);

      for (const option of options) {
        if (option.isActive) {
          optionMap.set(option.id, option);
        }
      }
    }

    const groupSelectionCounts = new Map<string, number>();
    const selectedOptions = selectedOptionIds.map((optionId) => {
      const option = optionMap.get(optionId);

      if (option === undefined) {
        throw new AppException(
          'Selected variant options must belong to active VARIANT_SELECTOR groups for the requested menu item.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
            details: {
              menuItemId,
              optionId,
            },
          },
        );
      }

      groupSelectionCounts.set(
        option.group.id,
        (groupSelectionCounts.get(option.group.id) ?? 0) + 1,
      );

      return option;
    });

    for (const [groupId, selectedCount] of groupSelectionCounts.entries()) {
      if (selectedCount > 1) {
        throw new AppException(
          'Variant combinations can include at most one option from each variant selector group.',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            code: ErrorCodes.unprocessableEntity,
            details: {
              menuItemId,
              optionGroupId: groupId,
              selectedCount,
            },
          },
        );
      }
    }

    return {
      selectedOptions,
      signature: buildVariantCombinationSignature(
        selectedOptions.map((selectedOption) => selectedOption.id),
      ),
      defaultName: buildVariantCombinationDefaultName(
        selectedOptions.map((selectedOption) => selectedOption.name),
      ),
    };
  }

  private normalizeCreateInventory(
    payload: CreateItemVariantCombinationDto,
  ): Pick<
    Prisma.ItemVariantCombinationUncheckedCreateInput,
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
    payload: UpdateItemVariantCombinationDto,
    combination: ItemVariantCombinationOwnershipRecord,
  ): Pick<
    Prisma.ItemVariantCombinationUpdateInput,
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
        combination.isStockTracked);

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
        : combination.isStockTracked
          ? {}
          : { stockQuantity: 0 }),
      ...(payload.lowStockThreshold !== undefined
        ? { lowStockThreshold: payload.lowStockThreshold }
        : {}),
    };
  }

  private assertInventoryValue(
    field: 'stockQuantity' | 'lowStockThreshold',
    value: number | undefined,
  ): void {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      throw new AppException(
        `${field} must be a non-negative integer when provided.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          code: ErrorCodes.unprocessableEntity,
          details: {
            field,
            value,
          },
        },
      );
    }
  }

  private assertSelectedOptionIdsAreUnique(selectedOptionIds: string[]): void {
    if (new Set(selectedOptionIds).size === selectedOptionIds.length) {
      return;
    }

    throw new AppException(
      'Variant combination option selections must not contain duplicate ids.',
      HttpStatus.UNPROCESSABLE_ENTITY,
      {
        code: ErrorCodes.unprocessableEntity,
      },
    );
  }

  private normalizeOptionalString(value: string | undefined): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
