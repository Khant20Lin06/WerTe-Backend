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
exports.MenuInventoryLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const menus_repository_1 = require("../repositories/menus.repository");
let MenuInventoryLifecycleService = class MenuInventoryLifecycleService {
    constructor(menusRepository) {
        this.menusRepository = menusRepository;
    }
    async reserveTrackedInventoryForOrder(items, client) {
        const alerts = new Map();
        const inventoryLotAllocationsByLineKey = {};
        for (const item of items) {
            if (item.menuItemStockTrackedSnapshot) {
                const previousItem = await this.menusRepository.findItemById(item.menuItemId, client);
                const usesInventoryLots = (await this.menusRepository.countItemInventoryLotsByMenuItemId(item.menuItemId, client)) > 0;
                if (usesInventoryLots) {
                    const lotAllocations = await this.reserveTrackedInventoryLots(item.menuItemId, item.quantity, client);
                    if (item.lineKey !== undefined && lotAllocations.length > 0) {
                        inventoryLotAllocationsByLineKey[item.lineKey] = lotAllocations;
                    }
                }
                const wasReserved = await this.menusRepository.decrementTrackedItemStock(item.menuItemId, item.quantity, client);
                if (!wasReserved) {
                    throw new app_exception_1.AppException('The requested item is no longer available in the requested quantity.', common_1.HttpStatus.CONFLICT, {
                        code: error_codes_1.ErrorCodes.conflict,
                        details: {
                            menuItemId: item.menuItemId,
                            requestedQuantity: item.quantity,
                        },
                    });
                }
                const nextItem = await this.menusRepository.findItemById(item.menuItemId, client);
                const nextAlert = this.buildItemAlertEvent(previousItem, nextItem);
                if (nextAlert !== null) {
                    alerts.set(`MENU_ITEM:${nextAlert.resourceId}`, nextAlert);
                }
            }
            if (item.variantCombinationStockTrackedSnapshot === true &&
                item.selectedVariantCombinationId !== undefined &&
                item.selectedVariantCombinationId !== null) {
                const wasReserved = await this.menusRepository.decrementTrackedVariantCombinationStock(item.selectedVariantCombinationId, item.quantity, client);
                if (!wasReserved) {
                    throw new app_exception_1.AppException('The selected variant combination is no longer available in the requested quantity.', common_1.HttpStatus.CONFLICT, {
                        code: error_codes_1.ErrorCodes.conflict,
                        details: {
                            combinationId: item.selectedVariantCombinationId,
                            requestedQuantity: item.quantity,
                        },
                    });
                }
            }
            for (const selectedOption of item.selectedOptions) {
                if (!selectedOption.itemOptionStockTrackedSnapshot) {
                    continue;
                }
                const previousOption = await this.menusRepository.findOptionById(selectedOption.itemOptionId, client);
                const wasReserved = await this.menusRepository.decrementTrackedOptionStock(selectedOption.itemOptionId, item.quantity, client);
                if (!wasReserved) {
                    throw new app_exception_1.AppException('One of the selected options is no longer available in the requested quantity.', common_1.HttpStatus.CONFLICT, {
                        code: error_codes_1.ErrorCodes.conflict,
                        details: {
                            itemOptionId: selectedOption.itemOptionId,
                            requestedQuantity: item.quantity,
                        },
                    });
                }
                const nextOption = await this.menusRepository.findOptionById(selectedOption.itemOptionId, client);
                const nextAlert = this.buildOptionAlertEvent(previousOption, nextOption);
                if (nextAlert !== null) {
                    alerts.set(`ITEM_OPTION:${nextAlert.resourceId}`, nextAlert);
                }
            }
        }
        return {
            alerts: [...alerts.values()],
            inventoryLotAllocationsByLineKey,
        };
    }
    async restoreTrackedInventoryForOrder(items, client) {
        for (const item of items) {
            if (item.menuItemStockTrackedSnapshot) {
                await this.menusRepository.incrementItemStock(item.menuItemId, item.quantity, client);
                for (const allocation of item.inventoryLotAllocations ?? []) {
                    await this.menusRepository.incrementItemInventoryLotRemainingQuantity(allocation.inventoryLotId, allocation.quantity, client);
                }
            }
            if (item.variantCombinationStockTrackedSnapshot === true &&
                item.selectedVariantCombinationId !== undefined &&
                item.selectedVariantCombinationId !== null) {
                await this.menusRepository.incrementVariantCombinationStock(item.selectedVariantCombinationId, item.quantity, client);
            }
            for (const selectedOption of item.selectedOptions) {
                if (!selectedOption.itemOptionStockTrackedSnapshot) {
                    continue;
                }
                await this.menusRepository.incrementOptionStock(selectedOption.itemOptionId, item.quantity, client);
            }
        }
    }
    async collectTrackedInventoryRestorationAlerts(items, client) {
        const itemQuantityById = new Map();
        const optionQuantityById = new Map();
        for (const item of items) {
            if (item.menuItemStockTrackedSnapshot) {
                this.accumulateQuantity(itemQuantityById, item.menuItemId, item.quantity);
            }
            for (const selectedOption of item.selectedOptions) {
                if (!selectedOption.itemOptionStockTrackedSnapshot) {
                    continue;
                }
                this.accumulateQuantity(optionQuantityById, selectedOption.itemOptionId, item.quantity);
            }
        }
        const alerts = [];
        for (const [menuItemId, restoredQuantity] of itemQuantityById.entries()) {
            const item = await this.menusRepository.findItemById(menuItemId, client);
            const alert = this.buildItemCompensationEvent(item, restoredQuantity);
            if (alert !== null) {
                alerts.push(alert);
            }
        }
        for (const [itemOptionId, restoredQuantity] of optionQuantityById.entries()) {
            const option = await this.menusRepository.findOptionById(itemOptionId, client);
            const alert = this.buildOptionCompensationEvent(option, restoredQuantity);
            if (alert !== null) {
                alerts.push(alert);
            }
        }
        return alerts;
    }
    async reserveTrackedInventoryLots(menuItemId, quantity, client) {
        const lots = await this.menusRepository.listItemInventoryLotsByMenuItemId(menuItemId, client);
        const availableLots = [...lots]
            .filter((lot) => lot.remainingQuantity > 0)
            .sort((left, right) => this.compareOptionalDates(left.expiryDate, right.expiryDate) ||
            left.receivedAt.getTime() - right.receivedAt.getTime() ||
            left.createdAt.getTime() - right.createdAt.getTime() ||
            left.id.localeCompare(right.id));
        const availableQuantity = availableLots.reduce((total, lot) => total + lot.remainingQuantity, 0);
        if (availableQuantity < quantity) {
            throw new app_exception_1.AppException('The requested item is no longer available in the requested quantity across its remaining inventory lots.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
                details: {
                    menuItemId,
                    requestedQuantity: quantity,
                    availableLotQuantity: availableQuantity,
                },
            });
        }
        const allocations = [];
        let remainingQuantity = quantity;
        for (const lot of availableLots) {
            if (remainingQuantity <= 0) {
                break;
            }
            const allocatedQuantity = Math.min(lot.remainingQuantity, remainingQuantity);
            const reserved = await this.menusRepository.decrementItemInventoryLotQuantity(lot.id, allocatedQuantity, client);
            if (!reserved) {
                throw new app_exception_1.AppException('The requested inventory lot is no longer available in the requested quantity.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        menuItemId,
                        lotId: lot.id,
                        requestedQuantity: allocatedQuantity,
                    },
                });
            }
            allocations.push({
                inventoryLotId: lot.id,
                batchNoSnapshot: lot.batchNo,
                expiryDateSnapshot: lot.expiryDate?.toISOString() ?? null,
                quantity: allocatedQuantity,
            });
            remainingQuantity -= allocatedQuantity;
        }
        return allocations;
    }
    compareOptionalDates(left, right) {
        if (left === null && right === null) {
            return 0;
        }
        if (left === null) {
            return 1;
        }
        if (right === null) {
            return -1;
        }
        return left.getTime() - right.getTime();
    }
    buildItemAlertEvent(previousItem, nextItem) {
        if (previousItem === null || nextItem === null) {
            return null;
        }
        const previousAttentionLevel = this.resolveItemAttentionLevel(previousItem);
        const nextAttentionLevel = this.resolveItemAttentionLevel(nextItem);
        if (nextAttentionLevel === null ||
            !this.shouldEmitAlert(previousAttentionLevel, nextAttentionLevel)) {
            return null;
        }
        return {
            merchantUserId: nextItem.branch.merchant.user.id,
            branchId: nextItem.branch.id,
            branchName: null,
            resourceType: 'MENU_ITEM',
            resourceId: nextItem.id,
            resourceLabel: nextItem.name,
            attentionLevel: nextAttentionLevel,
            stockQuantity: nextItem.stockQuantity ?? null,
            lowStockThreshold: nextItem.lowStockThreshold ?? null,
        };
    }
    buildOptionAlertEvent(previousOption, nextOption) {
        if (previousOption === null || nextOption === null) {
            return null;
        }
        const previousAttentionLevel = this.resolveOptionAttentionLevel(previousOption);
        const nextAttentionLevel = this.resolveOptionAttentionLevel(nextOption);
        if (nextAttentionLevel === null ||
            !this.shouldEmitAlert(previousAttentionLevel, nextAttentionLevel)) {
            return null;
        }
        return {
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
        };
    }
    buildItemCompensationEvent(item, restoredQuantity) {
        if (item === null || restoredQuantity <= 0) {
            return null;
        }
        return {
            merchantUserId: item.branch.merchant.user.id,
            branchId: item.branch.id,
            branchName: null,
            resourceType: 'MENU_ITEM',
            resourceId: item.id,
            resourceLabel: item.name,
            restoredQuantity,
            stockQuantity: item.stockQuantity ?? null,
            lowStockThreshold: item.lowStockThreshold ?? null,
        };
    }
    buildOptionCompensationEvent(option, restoredQuantity) {
        if (option === null || restoredQuantity <= 0) {
            return null;
        }
        return {
            merchantUserId: option.group.menuItem.branch.merchant.user.id,
            branchId: option.group.menuItem.branch.id,
            branchName: null,
            resourceType: 'ITEM_OPTION',
            resourceId: option.id,
            resourceLabel: option.name,
            restoredQuantity,
            stockQuantity: option.stockQuantity ?? null,
            lowStockThreshold: option.lowStockThreshold ?? null,
            menuItemName: option.group.menuItem.name,
        };
    }
    accumulateQuantity(quantities, resourceId, quantity) {
        quantities.set(resourceId, (quantities.get(resourceId) ?? 0) + quantity);
    }
    shouldEmitAlert(previousAttentionLevel, nextAttentionLevel) {
        return (previousAttentionLevel === null ||
            (previousAttentionLevel === 'LOW_STOCK' &&
                nextAttentionLevel === 'OUT_OF_STOCK'));
    }
    resolveItemAttentionLevel(item) {
        if (!item.isStockTracked) {
            return null;
        }
        if ((item.stockQuantity ?? 0) <= 0) {
            return 'OUT_OF_STOCK';
        }
        if (item.lowStockThreshold !== null &&
            item.lowStockThreshold !== undefined &&
            item.stockQuantity !== null &&
            item.stockQuantity <= item.lowStockThreshold) {
            return 'LOW_STOCK';
        }
        return null;
    }
    resolveOptionAttentionLevel(option) {
        if (!option.isStockTracked) {
            return null;
        }
        if ((option.stockQuantity ?? 0) <= 0) {
            return 'OUT_OF_STOCK';
        }
        if (option.lowStockThreshold !== null &&
            option.lowStockThreshold !== undefined &&
            option.stockQuantity !== null &&
            option.stockQuantity <= option.lowStockThreshold) {
            return 'LOW_STOCK';
        }
        return null;
    }
};
exports.MenuInventoryLifecycleService = MenuInventoryLifecycleService;
exports.MenuInventoryLifecycleService = MenuInventoryLifecycleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menus_repository_1.MenusRepository])
], MenuInventoryLifecycleService);
//# sourceMappingURL=menu-inventory-lifecycle.service.js.map