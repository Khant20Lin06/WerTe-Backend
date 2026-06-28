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
exports.MerchantMenuVariantCombinationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const item_variant_combination_dto_1 = require("../dto/item-variant-combination.dto");
const menu_item_policy_service_1 = require("../policies/menu-item-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const item_variant_combination_util_1 = require("../utils/item-variant-combination.util");
const menu_cache_service_1 = require("./menu-cache.service");
const menus_service_1 = require("./menus.service");
let MerchantMenuVariantCombinationsService = class MerchantMenuVariantCombinationsService {
    constructor(prisma, menusService, menusRepository, menuItemPolicyService, menuCache) {
        this.prisma = prisma;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuItemPolicyService = menuItemPolicyService;
        this.menuCache = menuCache;
    }
    async listItemVariantCombinations(currentUser, branchId, itemId) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const combinations = await this.menusService.listVariantCombinationsByMenuItemId(item.id);
        return combinations.map((combination) => (0, item_variant_combination_dto_1.toItemVariantCombinationDto)(combination));
    }
    async getItemVariantCombination(currentUser, branchId, itemId, combinationId) {
        const combination = await this.resolveOwnedVariantCombination(currentUser, branchId, itemId, combinationId);
        return (0, item_variant_combination_dto_1.toItemVariantCombinationDto)(combination);
    }
    async createItemVariantCombination(currentUser, branchId, itemId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const selection = await this.resolveVariantSelection(item.id, payload.selectedOptionIds);
        const existing = await this.menusRepository.findVariantCombinationByMenuItemIdAndSignature(item.id, selection.signature);
        if (existing !== null) {
            throw new app_exception_1.AppException('A variant combination with the same selected options already exists for this menu item.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
                details: {
                    menuItemId: item.id,
                    existingCombinationId: existing.id,
                },
            });
        }
        const combination = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestVariantCombinationSortOrderByMenuItemId(item.id, tx))?.sortOrder ?? -1) + 1;
            const created = await this.menusRepository.createVariantCombination({
                menuItemId: item.id,
                name: this.normalizeOptionalString(payload.name) ?? selection.defaultName,
                sku: this.normalizeOptionalString(payload.sku),
                signature: selection.signature,
                ...this.normalizeCreateInventory(payload),
                sortOrder: nextSortOrder,
                isActive: payload.isActive ?? true,
            }, tx);
            await this.menusRepository.replaceVariantCombinationOptions(created.id, selection.selectedOptions.map((selectedOption) => selectedOption.id), tx);
            return this.menusRepository.findVariantCombinationById(created.id, tx);
        });
        if (combination === null) {
            throw new app_exception_1.AppException('Created variant combination could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        void this.menuCache.invalidate(branchId);
        return (0, item_variant_combination_dto_1.toItemVariantCombinationDto)(combination);
    }
    async updateItemVariantCombination(currentUser, branchId, itemId, combinationId, payload) {
        const combination = await this.resolveOwnedVariantCombination(currentUser, branchId, itemId, combinationId);
        const selection = payload.selectedOptionIds !== undefined
            ? await this.resolveVariantSelection(combination.menuItem.id, payload.selectedOptionIds)
            : null;
        if (selection !== null) {
            const existing = await this.menusRepository.findVariantCombinationByMenuItemIdAndSignature(combination.menuItem.id, selection.signature);
            if (existing !== null && existing.id !== combination.id) {
                throw new app_exception_1.AppException('A variant combination with the same selected options already exists for this menu item.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        menuItemId: combination.menuItem.id,
                        existingCombinationId: existing.id,
                    },
                });
            }
        }
        const updated = await this.prisma.runInTransaction(async (tx) => {
            await this.menusRepository.updateVariantCombination(combination.id, {
                ...(selection !== null ? { signature: selection.signature } : {}),
                ...(payload.name !== undefined
                    ? {
                        name: this.normalizeOptionalString(payload.name) ?? combination.name,
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
            }, tx);
            if (selection !== null) {
                await this.menusRepository.replaceVariantCombinationOptions(combination.id, selection.selectedOptions.map((selectedOption) => selectedOption.id), tx);
            }
            return this.menusRepository.findVariantCombinationById(combination.id, tx);
        });
        if (updated === null) {
            throw new app_exception_1.AppException('Updated variant combination could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        void this.menuCache.invalidate(branchId);
        return (0, item_variant_combination_dto_1.toItemVariantCombinationDto)(updated);
    }
    async resolveOwnedItem(currentUser, branchId, itemId) {
        const item = await this.menusService.findItemOwnedByUserId(currentUser.userId, itemId);
        if (item === null || item.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu item was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canManageItem(currentUser, item)) {
            throw new app_exception_1.AppException('You are not allowed to manage variant combinations for this menu item.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return item;
    }
    async resolveOwnedVariantCombination(currentUser, branchId, itemId, combinationId) {
        const combination = await this.menusService.findVariantCombinationById(combinationId);
        if (combination === null ||
            combination.menuItem.branch.id !== branchId ||
            combination.menuItem.id !== itemId) {
            throw new app_exception_1.AppException('Variant combination was not found for the requested menu item.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (combination.menuItem.branch.merchant.user.id !== currentUser.userId) {
            throw new app_exception_1.AppException('You are not allowed to manage this variant combination.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return combination;
    }
    async resolveVariantSelection(menuItemId, selectedOptionIds) {
        this.assertSelectedOptionIdsAreUnique(selectedOptionIds);
        const variantGroups = (await this.menusService.listOptionGroupsByMenuItemId(menuItemId)).filter((group) => group.isActive && group.kind === client_1.ItemOptionGroupKind.VARIANT_SELECTOR);
        if (variantGroups.length === 0) {
            throw new app_exception_1.AppException('Variant combinations require at least one active variant selector option group.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    menuItemId,
                },
            });
        }
        const optionMap = new Map();
        for (const group of variantGroups) {
            const options = await this.menusService.listOptionsByOptionGroupId(group.id);
            for (const option of options) {
                if (option.isActive) {
                    optionMap.set(option.id, option);
                }
            }
        }
        const groupSelectionCounts = new Map();
        const selectedOptions = selectedOptionIds.map((optionId) => {
            const option = optionMap.get(optionId);
            if (option === undefined) {
                throw new app_exception_1.AppException('Selected variant options must belong to active VARIANT_SELECTOR groups for the requested menu item.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                    details: {
                        menuItemId,
                        optionId,
                    },
                });
            }
            groupSelectionCounts.set(option.group.id, (groupSelectionCounts.get(option.group.id) ?? 0) + 1);
            return option;
        });
        for (const [groupId, selectedCount] of groupSelectionCounts.entries()) {
            if (selectedCount > 1) {
                throw new app_exception_1.AppException('Variant combinations can include at most one option from each variant selector group.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                    details: {
                        menuItemId,
                        optionGroupId: groupId,
                        selectedCount,
                    },
                });
            }
        }
        return {
            selectedOptions,
            signature: (0, item_variant_combination_util_1.buildVariantCombinationSignature)(selectedOptions.map((selectedOption) => selectedOption.id)),
            defaultName: (0, item_variant_combination_util_1.buildVariantCombinationDefaultName)(selectedOptions.map((selectedOption) => selectedOption.name)),
        };
    }
    normalizeCreateInventory(payload) {
        const hasInventoryFields = payload.stockQuantity !== undefined ||
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
    normalizeUpdateInventory(payload, combination) {
        const hasInventoryFields = payload.isStockTracked !== undefined ||
            payload.stockQuantity !== undefined ||
            payload.lowStockThreshold !== undefined;
        if (!hasInventoryFields) {
            return {};
        }
        this.assertInventoryValue('stockQuantity', payload.stockQuantity);
        this.assertInventoryValue('lowStockThreshold', payload.lowStockThreshold);
        const isStockTracked = payload.isStockTracked ??
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
    assertInventoryValue(field, value) {
        if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
            throw new app_exception_1.AppException(`${field} must be a non-negative integer when provided.`, common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    field,
                    value,
                },
            });
        }
    }
    assertSelectedOptionIdsAreUnique(selectedOptionIds) {
        if (new Set(selectedOptionIds).size === selectedOptionIds.length) {
            return;
        }
        throw new app_exception_1.AppException('Variant combination option selections must not contain duplicate ids.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
            code: error_codes_1.ErrorCodes.unprocessableEntity,
        });
    }
    normalizeOptionalString(value) {
        if (value === undefined) {
            return undefined;
        }
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : null;
    }
};
exports.MerchantMenuVariantCombinationsService = MerchantMenuVariantCombinationsService;
exports.MerchantMenuVariantCombinationsService = MerchantMenuVariantCombinationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_item_policy_service_1.MenuItemPolicyService,
        menu_cache_service_1.MenuCacheService])
], MerchantMenuVariantCombinationsService);
//# sourceMappingURL=merchant-menu-variant-combinations.service.js.map