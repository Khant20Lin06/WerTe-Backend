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
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { BranchesService } from '../../branches/services/branches.service';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { MenuItemDto, toMenuItemDto } from '../dto/menu-item.dto';
import {
  MenuItemRuleProfileDto,
  toMenuItemRuleProfileDto,
} from '../dto/menu-item-rule-profile.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { MenuItemPolicyService } from '../policies/menu-item-policy.service';
import { MenusRepository } from '../repositories/menus.repository';
import {
  assertMenuVerticalCatalogRules,
  buildMenuVerticalCatalogRuleProfiles,
  MenuVerticalStoreTypeSummary,
} from '../utils/menu-vertical-catalog-rule.util';
import { MenuCacheService } from './menu-cache.service';
import { MenuItemInventoryService } from './menu-item-inventory.service';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantMenuItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchesService: BranchesService,
    private readonly menusService: MenusService,
    private readonly menusRepository: MenusRepository,
    private readonly menuItemPolicyService: MenuItemPolicyService,
    private readonly auditService: AuditService,
    private readonly menuItemInventoryService: MenuItemInventoryService,
    private readonly menuCache: MenuCacheService,
  ) {}

  async listBranchItems(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<MenuItemDto[]> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);
    const items = await this.menusService.listItemsByBranchId(branch.id);

    return items.map((item) => toMenuItemDto(item));
  }

  async getBranchItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<MenuItemDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);

    return toMenuItemDto(item);
  }

  async listBranchItemRuleProfiles(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<MenuItemRuleProfileDto[]> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);
    const approvedStoreTypes = this.resolveBranchDefaultRuleStoreTypes(
      await this.loadApprovedRuleStoreTypes(branch.id),
      branch.storeType,
      branch.primaryStoreTypeId,
    );

    return buildMenuVerticalCatalogRuleProfiles(approvedStoreTypes).map((profile) =>
      toMenuItemRuleProfileDto(profile),
    );
  }

  async createBranchItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    payload: CreateMenuItemDto,
  ): Promise<MenuItemDto> {
    const branch = await this.resolveOwnedBranch(currentUser, branchId);
    const category = await this.resolveOptionalOwnedCategory(
      currentUser,
      branchId,
      payload.categoryId,
    );

    const item = await this.prisma.runInTransaction(async (tx) => {
      const nextSortOrder =
        payload.sortOrder ??
        ((await this.menusRepository.findHighestItemSortOrderByBranchId(
          branch.id,
          tx,
        ))?.sortOrder ?? -1) + 1;
      const inventoryData = this.menuItemInventoryService.normalizeCreateInventory(payload);
      const approvedStoreTypes = await this.loadApprovedRuleStoreTypes(branch.id, tx);
      const scopedStoreTypeIds = this.resolveScopedStoreTypeIds(
        branch.id,
        payload.storeTypeIds,
        approvedStoreTypes,
      );
      const effectiveStoreTypes = this.resolveCreateEffectiveRuleStoreTypes(
        branch,
        approvedStoreTypes,
        scopedStoreTypeIds,
      );

      assertMenuVerticalCatalogRules(effectiveStoreTypes, {
        sku: payload.sku,
        brand: payload.brand,
        attributes: payload.attributes ?? null,
        isStockTracked: inventoryData.isStockTracked === true,
      });

      const createdItem = await this.menusRepository.createItem(
        {
          branchId: branch.id,
          categoryId: category?.id ?? null,
          name: payload.name,
          description: payload.description,
          imageUrl: payload.imageUrl,
          imageUrlsJson: this.toOptionalJson(payload.imageUrls),
          sku: payload.sku,
          barcode: payload.barcode,
          brand: payload.brand,
          attributesJson: this.toOptionalJson(payload.attributes),
          basePrice: payload.basePrice,
          ...inventoryData,
          sortOrder: nextSortOrder,
          isAvailable: payload.isAvailable ?? true,
        },
        tx,
      );

      await this.menusRepository.replaceItemStoreTypes(
        createdItem.id,
        scopedStoreTypeIds,
        tx,
      );

      return this.menusRepository.findItemById(createdItem.id, tx);
    });

    if (item === null) {
      throw new AppException(
        'Created menu item could not be reloaded.',
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
      action: 'menu_items.scope_created',
      resourceType: AuditResourceType.MENU_ITEM,
      resourceId: item.id,
      resourceLabel: item.name,
      branchId: branch.id,
      metadataJson: {
        afterScope: this.buildScopeSnapshot(item.storeTypes),
        categoryId: item.category?.id ?? null,
        isAvailable: item.isAvailable,
        isStockTracked: item.isStockTracked,
      },
    });

    void this.menuCache.invalidate(branch.id);

    return toMenuItemDto(item);
  }

  async updateBranchItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    payload: UpdateMenuItemDto,
  ): Promise<MenuItemDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    const category = await this.resolveOptionalOwnedCategory(
      currentUser,
      branchId,
      payload.categoryId,
    );
    const inventoryData = this.menuItemInventoryService.normalizeUpdateInventory(payload, item);

    const updatedItem = await this.prisma.runInTransaction(async (tx) => {
      const approvedStoreTypes = await this.loadApprovedRuleStoreTypes(branchId, tx);
      const scopedStoreTypeIds =
        payload.storeTypeIds !== undefined
          ? this.resolveScopedStoreTypeIds(
              branchId,
              payload.storeTypeIds,
              approvedStoreTypes,
            )
          : undefined;
      const effectiveStoreTypes = this.resolveUpdateEffectiveRuleStoreTypes(
        item,
        approvedStoreTypes,
        scopedStoreTypeIds,
      );

      assertMenuVerticalCatalogRules(effectiveStoreTypes, {
        sku: payload.sku !== undefined ? payload.sku : item.sku,
        brand: payload.brand !== undefined ? payload.brand : item.brand,
        attributes:
          payload.attributes !== undefined
            ? payload.attributes
            : this.toJsonObject(item.attributesJson),
        isStockTracked: this.menuItemInventoryService.resolveNextItemStockTracking(
          payload,
          item,
        ),
      });

      const nextItem = await this.menusRepository.updateItem(
        item.id,
        {
          ...(payload.categoryId !== undefined
            ? { categoryId: category?.id ?? null }
            : {}),
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
          ...(payload.imageUrls !== undefined
            ? { imageUrlsJson: this.toOptionalJson(payload.imageUrls) }
            : {}),
          ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
          ...(payload.barcode !== undefined ? { barcode: payload.barcode } : {}),
          ...(payload.brand !== undefined ? { brand: payload.brand } : {}),
          ...(payload.attributes !== undefined
            ? { attributesJson: this.toOptionalJson(payload.attributes) }
            : {}),
          ...(payload.basePrice !== undefined
            ? { basePrice: payload.basePrice }
            : {}),
          ...inventoryData,
          ...(payload.sortOrder !== undefined
            ? { sortOrder: payload.sortOrder }
            : {}),
          ...(payload.isAvailable !== undefined
            ? { isAvailable: payload.isAvailable }
            : {}),
        },
        tx,
      );

      if (scopedStoreTypeIds !== undefined) {
        await this.menusRepository.replaceItemStoreTypes(
          item.id,
          scopedStoreTypeIds,
          tx,
        );

        return this.menusRepository.findItemById(nextItem.id, tx);
      }

      return nextItem;
    });

    if (updatedItem === null) {
      throw new AppException(
        'Updated menu item could not be reloaded.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    if (payload.storeTypeIds !== undefined) {
      await this.auditService.logAction({
        actorType: AuditActorType.USER,
        actorUserId: currentUser.userId,
        actorRole: currentUser.role,
        actionSource: AuditActionSource.API,
        action: 'menu_items.scope_updated',
        resourceType: AuditResourceType.MENU_ITEM,
        resourceId: updatedItem.id,
        resourceLabel: updatedItem.name,
        branchId: updatedItem.branch.id,
        metadataJson: {
          beforeScope: this.buildScopeSnapshot(item.storeTypes),
          afterScope: this.buildScopeSnapshot(updatedItem.storeTypes),
          categoryId: updatedItem.category?.id ?? null,
          isAvailable: updatedItem.isAvailable,
          isStockTracked: updatedItem.isStockTracked,
        },
      });
    }

    void this.menuCache.invalidate(branchId);

    return toMenuItemDto(updatedItem);
  }

  async adjustBranchItemInventory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
    payload: AdjustInventoryDto,
  ): Promise<MenuItemDto> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);

    const result = await this.menuItemInventoryService.adjustBranchItemInventory(
      currentUser,
      item,
      payload,
    );

    void this.menuCache.invalidate(branchId);

    return result;
  }

  async deleteBranchItem(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    itemId: string,
  ): Promise<void> {
    const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
    await this.menusRepository.deleteItem(item.id);
    void this.menuCache.invalidate(branchId);
  }

  private buildScopeSnapshot(
    storeTypes: MenuItemOwnershipRecord['storeTypes'],
  ): Prisma.InputJsonValue {
    return {
      scopeMode: this.toScopeMode(storeTypes.length),
      storeTypeIds: storeTypes.map((assignment) => assignment.storeType.id),
      storeTypeCodes: storeTypes.map((assignment) => assignment.storeType.code),
    };
  }

  private toScopeMode(storeTypeCount: number): string {
    return storeTypeCount === 0
      ? 'ALL_APPROVED_STORE_TYPES'
      : 'SELECTED_STORE_TYPES';
  }

  private async resolveOwnedBranch(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<BranchOwnershipRecord> {
    const branch = await this.branchesService.findOwnedByUserId(
      currentUser.userId,
      branchId,
    );

    if (branch === null) {
      throw new AppException('Branch was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (!this.menuItemPolicyService.canManageBranchCatalog(currentUser, branch)) {
      throw new AppException(
        'You are not allowed to manage menu items for this branch.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return branch;
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
        'You are not allowed to manage this menu item.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return item;
  }

  private async resolveOptionalOwnedCategory(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    categoryId?: string,
  ): Promise<MenuCategoryOwnershipRecord | null> {
    if (categoryId === undefined) {
      return null;
    }

    if (categoryId.trim().length === 0) {
      return null;
    }

    const category = await this.menusService.findCategoryOwnedByUserId(
      currentUser.userId,
      categoryId,
    );

    if (category === null || category.branch.id !== branchId) {
      throw new AppException(
        'Menu category was not found for the requested branch.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    if (!this.menuItemPolicyService.canUseCategory(currentUser, category)) {
      throw new AppException(
        'You are not allowed to use this menu category.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    return category;
  }

  private toOptionalJson(
    value: Record<string, unknown> | string[] | undefined,
  ): Prisma.InputJsonValue | undefined {
    if (value === undefined) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private async loadApprovedRuleStoreTypes(
    branchId: string,
    client?: Prisma.TransactionClient,
  ): Promise<MenuVerticalStoreTypeSummary[]> {
    const approvedStoreTypes =
      await this.menusRepository.listApprovedStoreTypesByBranchId(branchId, client);

    if (approvedStoreTypes.length === 0) {
      return [];
    }

    return approvedStoreTypes.map((assignment) => ({
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    }));
  }

  private resolveScopedStoreTypeIds(
    branchId: string,
    storeTypeIds: string[] | undefined,
    approvedStoreTypes: MenuVerticalStoreTypeSummary[],
  ): string[] {
    const normalizedStoreTypeIds = this.normalizeStoreTypeIds(storeTypeIds);

    if (normalizedStoreTypeIds.length === 0) {
      return [];
    }

    const approvedStoreTypeIdSet = new Set(
      approvedStoreTypes.map((assignment) => assignment.id),
    );

    const invalidStoreTypeIds = normalizedStoreTypeIds.filter(
      (storeTypeId) => !approvedStoreTypeIdSet.has(storeTypeId),
    );

    if (invalidStoreTypeIds.length > 0) {
      throw new AppException(
        'Item storeTypeIds must belong to approved active store types for the branch.',
        HttpStatus.BAD_REQUEST,
        {
          code: ErrorCodes.validationFailed,
          details: {
            branchId,
            invalidStoreTypeIds,
          },
        },
      );
    }

    return normalizedStoreTypeIds;
  }

  private normalizeStoreTypeIds(storeTypeIds?: string[]): string[] {
    if (storeTypeIds === undefined) {
      return [];
    }

    const normalizedValues = storeTypeIds
      .map((storeTypeId) => storeTypeId.trim())
      .filter((storeTypeId) => storeTypeId.length > 0);

    return [...new Set(normalizedValues)];
  }

  private resolveCreateEffectiveRuleStoreTypes(
    branch: BranchOwnershipRecord,
    approvedStoreTypes: MenuVerticalStoreTypeSummary[],
    scopedStoreTypeIds: string[],
  ): MenuVerticalStoreTypeSummary[] {
    if (scopedStoreTypeIds.length > 0) {
      return this.filterStoreTypesByIds(approvedStoreTypes, scopedStoreTypeIds);
    }

    return this.resolveBranchDefaultRuleStoreTypes(
      approvedStoreTypes,
      branch.storeType,
      branch.primaryStoreTypeId,
    );
  }

  private resolveUpdateEffectiveRuleStoreTypes(
    item: MenuItemOwnershipRecord,
    approvedStoreTypes: MenuVerticalStoreTypeSummary[],
    scopedStoreTypeIds: string[] | undefined,
  ): MenuVerticalStoreTypeSummary[] {
    if (scopedStoreTypeIds !== undefined) {
      if (scopedStoreTypeIds.length > 0) {
        return this.filterStoreTypesByIds(approvedStoreTypes, scopedStoreTypeIds);
      }

      return this.resolveBranchDefaultRuleStoreTypes(approvedStoreTypes);
    }

    if (item.storeTypes.length > 0) {
      return item.storeTypes.map((assignment) => ({
        id: assignment.storeType.id,
        code: assignment.storeType.code,
        name: assignment.storeType.name,
        sortOrder: assignment.storeType.sortOrder,
      }));
    }

    return this.resolveBranchDefaultRuleStoreTypes(approvedStoreTypes);
  }

  private filterStoreTypesByIds(
    approvedStoreTypes: MenuVerticalStoreTypeSummary[],
    scopedStoreTypeIds: string[],
  ): MenuVerticalStoreTypeSummary[] {
    const scopedStoreTypeIdSet = new Set(scopedStoreTypeIds);

    return approvedStoreTypes.filter((storeType) =>
      scopedStoreTypeIdSet.has(storeType.id),
    );
  }

  private resolveBranchDefaultRuleStoreTypes(
    approvedStoreTypes: MenuVerticalStoreTypeSummary[],
    fallbackStoreTypeCode?: string | null,
    fallbackStoreTypeId?: string | null,
  ): MenuVerticalStoreTypeSummary[] {
    if (approvedStoreTypes.length > 0) {
      return approvedStoreTypes;
    }

    const normalizedStoreTypeCode = fallbackStoreTypeCode?.trim().toLowerCase() ?? '';

    if (normalizedStoreTypeCode.length === 0) {
      return [];
    }

    return [
      {
        id:
          fallbackStoreTypeId ??
          `branch_primary_store_type:${normalizedStoreTypeCode}`,
        code: normalizedStoreTypeCode,
        name: this.humanizeStoreTypeCode(normalizedStoreTypeCode),
        sortOrder: 0,
      },
    ];
  }

  private humanizeStoreTypeCode(storeTypeCode: string): string {
    return storeTypeCode
      .split('_')
      .filter((segment) => segment.length > 0)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private toJsonObject(
    value: Prisma.JsonValue | null,
  ): Record<string, unknown> | null {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }
}
