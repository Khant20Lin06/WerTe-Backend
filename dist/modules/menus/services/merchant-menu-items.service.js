"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantMenuItemsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const branches_service_1 = require("../../branches/services/branches.service");
const menu_item_dto_1 = require("../dto/menu-item.dto");
const menu_item_rule_profile_dto_1 = require("../dto/menu-item-rule-profile.dto");
const menu_item_policy_service_1 = require("../policies/menu-item-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menu_vertical_catalog_rule_util_1 = require("../utils/menu-vertical-catalog-rule.util");
const menu_cache_service_1 = require("./menu-cache.service");
const menu_item_inventory_service_1 = require("./menu-item-inventory.service");
const menus_service_1 = require("./menus.service");
let MerchantMenuItemsService = class MerchantMenuItemsService {
    constructor(prisma, branchesService, menusService, menusRepository, menuItemPolicyService, auditService, menuItemInventoryService, menuCache) {
        this.prisma = prisma;
        this.branchesService = branchesService;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuItemPolicyService = menuItemPolicyService;
        this.auditService = auditService;
        this.menuItemInventoryService = menuItemInventoryService;
        this.menuCache = menuCache;
    }
    async listBranchItems(currentUser, branchId) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const items = await this.menusService.listItemsByBranchId(branch.id);
        return items.map((item) => (0, menu_item_dto_1.toMenuItemDto)(item));
    }
    async getBranchItem(currentUser, branchId, itemId) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        return (0, menu_item_dto_1.toMenuItemDto)(item);
    }
    async listBranchItemRuleProfiles(currentUser, branchId) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const approvedStoreTypes = this.resolveBranchDefaultRuleStoreTypes(await this.loadApprovedRuleStoreTypes(branch.id), branch.storeType, branch.primaryStoreTypeId);
        return (0, menu_vertical_catalog_rule_util_1.buildMenuVerticalCatalogRuleProfiles)(approvedStoreTypes).map((profile) => (0, menu_item_rule_profile_dto_1.toMenuItemRuleProfileDto)(profile));
    }
    async createBranchItem(currentUser, branchId, payload) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const category = await this.resolveOptionalOwnedCategory(currentUser, branchId, payload.categoryId);
        const item = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestItemSortOrderByBranchId(branch.id, tx))?.sortOrder ?? -1) + 1;
            const inventoryData = this.menuItemInventoryService.normalizeCreateInventory(payload);
            const approvedStoreTypes = await this.loadApprovedRuleStoreTypes(branch.id, tx);
            const scopedStoreTypeIds = this.resolveScopedStoreTypeIds(branch.id, payload.storeTypeIds, approvedStoreTypes);
            const effectiveStoreTypes = this.resolveCreateEffectiveRuleStoreTypes(branch, approvedStoreTypes, scopedStoreTypeIds);
            (0, menu_vertical_catalog_rule_util_1.assertMenuVerticalCatalogRules)(effectiveStoreTypes, {
                sku: payload.sku,
                brand: payload.brand,
                attributes: payload.attributes ?? null,
                isStockTracked: inventoryData.isStockTracked === true,
            });
            const createdItem = await this.menusRepository.createItem({
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
            }, tx);
            await this.menusRepository.replaceItemStoreTypes(createdItem.id, scopedStoreTypeIds, tx);
            return this.menusRepository.findItemById(createdItem.id, tx);
        });
        if (item === null) {
            throw new app_exception_1.AppException('Created menu item could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_items.scope_created',
            resourceType: client_1.AuditResourceType.MENU_ITEM,
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
        return (0, menu_item_dto_1.toMenuItemDto)(item);
    }
    async updateBranchItem(currentUser, branchId, itemId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const category = await this.resolveOptionalOwnedCategory(currentUser, branchId, payload.categoryId);
        const inventoryData = this.menuItemInventoryService.normalizeUpdateInventory(payload, item);
        const updatedItem = await this.prisma.runInTransaction(async (tx) => {
            const approvedStoreTypes = await this.loadApprovedRuleStoreTypes(branchId, tx);
            const scopedStoreTypeIds = payload.storeTypeIds !== undefined
                ? this.resolveScopedStoreTypeIds(branchId, payload.storeTypeIds, approvedStoreTypes)
                : undefined;
            const effectiveStoreTypes = this.resolveUpdateEffectiveRuleStoreTypes(item, approvedStoreTypes, scopedStoreTypeIds);
            (0, menu_vertical_catalog_rule_util_1.assertMenuVerticalCatalogRules)(effectiveStoreTypes, {
                sku: payload.sku !== undefined ? payload.sku : item.sku,
                brand: payload.brand !== undefined ? payload.brand : item.brand,
                attributes: payload.attributes !== undefined
                    ? payload.attributes
                    : this.toJsonObject(item.attributesJson),
                isStockTracked: this.menuItemInventoryService.resolveNextItemStockTracking(payload, item),
            });
            const nextItem = await this.menusRepository.updateItem(item.id, {
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
            }, tx);
            if (scopedStoreTypeIds !== undefined) {
                await this.menusRepository.replaceItemStoreTypes(item.id, scopedStoreTypeIds, tx);
                return this.menusRepository.findItemById(nextItem.id, tx);
            }
            return nextItem;
        });
        if (updatedItem === null) {
            throw new app_exception_1.AppException('Updated menu item could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        if (payload.storeTypeIds !== undefined) {
            await this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: 'menu_items.scope_updated',
                resourceType: client_1.AuditResourceType.MENU_ITEM,
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
        return (0, menu_item_dto_1.toMenuItemDto)(updatedItem);
    }
    async adjustBranchItemInventory(currentUser, branchId, itemId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const result = await this.menuItemInventoryService.adjustBranchItemInventory(currentUser, item, payload);
        void this.menuCache.invalidate(branchId);
        return result;
    }
    async deleteBranchItem(currentUser, branchId, itemId) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        await this.menusRepository.deleteItem(item.id);
        void this.menuCache.invalidate(branchId);
    }
    buildScopeSnapshot(storeTypes) {
        return {
            scopeMode: this.toScopeMode(storeTypes.length),
            storeTypeIds: storeTypes.map((assignment) => assignment.storeType.id),
            storeTypeCodes: storeTypes.map((assignment) => assignment.storeType.code),
        };
    }
    toScopeMode(storeTypeCount) {
        return storeTypeCount === 0
            ? 'ALL_APPROVED_STORE_TYPES'
            : 'SELECTED_STORE_TYPES';
    }
    async resolveOwnedBranch(currentUser, branchId) {
        const branch = await this.branchesService.findOwnedByUserId(currentUser.userId, branchId);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canManageBranchCatalog(currentUser, branch)) {
            throw new app_exception_1.AppException('You are not allowed to manage menu items for this branch.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return branch;
    }
    async resolveOwnedItem(currentUser, branchId, itemId) {
        const item = await this.menusService.findItemOwnedByUserId(currentUser.userId, itemId);
        if (item === null || item.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu item was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canManageItem(currentUser, item)) {
            throw new app_exception_1.AppException('You are not allowed to manage this menu item.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return item;
    }
    async resolveOptionalOwnedCategory(currentUser, branchId, categoryId) {
        if (categoryId === undefined) {
            return null;
        }
        if (categoryId.trim().length === 0) {
            return null;
        }
        const category = await this.menusService.findCategoryOwnedByUserId(currentUser.userId, categoryId);
        if (category === null || category.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu category was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canUseCategory(currentUser, category)) {
            throw new app_exception_1.AppException('You are not allowed to use this menu category.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return category;
    }
    toOptionalJson(value) {
        if (value === undefined) {
            return undefined;
        }
        return value;
    }
    async loadApprovedRuleStoreTypes(branchId, client) {
        const approvedStoreTypes = await this.menusRepository.listApprovedStoreTypesByBranchId(branchId, client);
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
    resolveScopedStoreTypeIds(branchId, storeTypeIds, approvedStoreTypes) {
        const normalizedStoreTypeIds = this.normalizeStoreTypeIds(storeTypeIds);
        if (normalizedStoreTypeIds.length === 0) {
            return [];
        }
        const approvedStoreTypeIdSet = new Set(approvedStoreTypes.map((assignment) => assignment.id));
        const invalidStoreTypeIds = normalizedStoreTypeIds.filter((storeTypeId) => !approvedStoreTypeIdSet.has(storeTypeId));
        if (invalidStoreTypeIds.length > 0) {
            throw new app_exception_1.AppException('Item storeTypeIds must belong to approved active store types for the branch.', common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.validationFailed,
                details: {
                    branchId,
                    invalidStoreTypeIds,
                },
            });
        }
        return normalizedStoreTypeIds;
    }
    normalizeStoreTypeIds(storeTypeIds) {
        if (storeTypeIds === undefined) {
            return [];
        }
        const normalizedValues = storeTypeIds
            .map((storeTypeId) => storeTypeId.trim())
            .filter((storeTypeId) => storeTypeId.length > 0);
        return [...new Set(normalizedValues)];
    }
    resolveCreateEffectiveRuleStoreTypes(branch, approvedStoreTypes, scopedStoreTypeIds) {
        if (scopedStoreTypeIds.length > 0) {
            return this.filterStoreTypesByIds(approvedStoreTypes, scopedStoreTypeIds);
        }
        return this.resolveBranchDefaultRuleStoreTypes(approvedStoreTypes, branch.storeType, branch.primaryStoreTypeId);
    }
    resolveUpdateEffectiveRuleStoreTypes(item, approvedStoreTypes, scopedStoreTypeIds) {
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
    filterStoreTypesByIds(approvedStoreTypes, scopedStoreTypeIds) {
        const scopedStoreTypeIdSet = new Set(scopedStoreTypeIds);
        return approvedStoreTypes.filter((storeType) => scopedStoreTypeIdSet.has(storeType.id));
    }
    resolveBranchDefaultRuleStoreTypes(approvedStoreTypes, fallbackStoreTypeCode, fallbackStoreTypeId) {
        if (approvedStoreTypes.length > 0) {
            return approvedStoreTypes;
        }
        const normalizedStoreTypeCode = fallbackStoreTypeCode?.trim().toLowerCase() ?? '';
        if (normalizedStoreTypeCode.length === 0) {
            return [];
        }
        return [
            {
                id: fallbackStoreTypeId ??
                    `branch_primary_store_type:${normalizedStoreTypeCode}`,
                code: normalizedStoreTypeCode,
                name: this.humanizeStoreTypeCode(normalizedStoreTypeCode),
                sortOrder: 0,
            },
        ];
    }
    humanizeStoreTypeCode(storeTypeCode) {
        return storeTypeCode
            .split('_')
            .filter((segment) => segment.length > 0)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(' ');
    }
    toJsonObject(value) {
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        return value;
    }
};
exports.MerchantMenuItemsService = MerchantMenuItemsService;
exports.MerchantMenuItemsService = MerchantMenuItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branches_service_1.BranchesService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_item_policy_service_1.MenuItemPolicyService,
        audit_service_1.AuditService,
        menu_item_inventory_service_1.MenuItemInventoryService,
        menu_cache_service_1.MenuCacheService])
], MerchantMenuItemsService);
//# sourceMappingURL=merchant-menu-items.service.js.map