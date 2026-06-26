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
exports.MenusRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const branch_catalog_entity_1 = require("../entities/branch-catalog.entity");
const item_option_group_ownership_entity_1 = require("../entities/item-option-group-ownership.entity");
const item_option_ownership_entity_1 = require("../entities/item-option-ownership.entity");
const item_variant_combination_ownership_entity_1 = require("../entities/item-variant-combination-ownership.entity");
const menu_item_inventory_lot_entity_1 = require("../entities/menu-item-inventory-lot.entity");
const menu_category_ownership_entity_1 = require("../entities/menu-category-ownership.entity");
const menu_item_ownership_entity_1 = require("../entities/menu-item-ownership.entity");
const approvedBranchStoreTypeInclude = client_1.Prisma.validator()({
    storeType: {
        select: {
            id: true,
            code: true,
            name: true,
            sortOrder: true,
        },
    },
});
let MenusRepository = class MenusRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findCategoryById(id, client = this.prisma) {
        return client.menuCategory.findUnique({
            where: { id },
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    listCategoriesByBranchId(branchId) {
        return this.prisma.menuCategory.findMany({
            where: { branchId },
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createCategory(data, client = this.prisma) {
        return client.menuCategory.create({
            data,
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    updateCategory(id, data, client = this.prisma) {
        return client.menuCategory.update({
            where: { id },
            data,
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    findHighestCategorySortOrderByBranchId(branchId, client = this.prisma) {
        return client.menuCategory.findFirst({
            where: { branchId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findItemById(id, client = this.prisma) {
        return client.menuItem.findUnique({
            where: { id },
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    listItemsByBranchId(branchId) {
        return this.prisma.menuItem.findMany({
            where: { branchId },
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    listItemsByIds(ids, client = this.prisma) {
        return client.menuItem.findMany({
            where: { id: { in: ids } },
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    createItem(data, client = this.prisma) {
        return client.menuItem.create({
            data,
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    updateItem(id, data, client = this.prisma) {
        return client.menuItem.update({
            where: { id },
            data,
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    async decrementTrackedItemStock(itemId, quantity, client = this.prisma) {
        const result = await client.menuItem.updateMany({
            where: {
                id: itemId,
                isStockTracked: true,
                stockQuantity: {
                    not: null,
                    gte: quantity,
                },
            },
            data: {
                stockQuantity: {
                    decrement: quantity,
                },
            },
        });
        return result.count > 0;
    }
    async adjustTrackedItemStock(itemId, delta, client = this.prisma) {
        if (delta === 0) {
            return true;
        }
        const result = await client.menuItem.updateMany({
            where: {
                id: itemId,
                isStockTracked: true,
                stockQuantity: delta < 0
                    ? {
                        not: null,
                        gte: Math.abs(delta),
                    }
                    : {
                        not: null,
                    },
            },
            data: {
                stockQuantity: delta < 0
                    ? {
                        decrement: Math.abs(delta),
                    }
                    : {
                        increment: delta,
                    },
            },
        });
        return result.count > 0;
    }
    incrementItemStock(itemId, quantity, client = this.prisma) {
        return client.$executeRaw `
      UPDATE "MenuItem"
      SET "stockQuantity" = COALESCE("stockQuantity", 0) + ${quantity}
      WHERE "id" = ${itemId}
    `;
    }
    findHighestItemSortOrderByBranchId(branchId, client = this.prisma) {
        return client.menuItem.findFirst({
            where: { branchId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findOptionGroupById(id) {
        return this.prisma.itemOptionGroup.findUnique({
            where: { id },
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    listOptionGroupsByMenuItemId(menuItemId) {
        return this.prisma.itemOptionGroup.findMany({
            where: { menuItemId },
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createOptionGroup(data, client = this.prisma) {
        return client.itemOptionGroup.create({
            data,
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    updateOptionGroup(id, data, client = this.prisma) {
        return client.itemOptionGroup.update({
            where: { id },
            data,
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    findHighestOptionGroupSortOrderByMenuItemId(menuItemId, client = this.prisma) {
        return client.itemOptionGroup.findFirst({
            where: { menuItemId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findOptionById(id, client = this.prisma) {
        return client.itemOption.findUnique({
            where: { id },
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
    listOptionsByOptionGroupId(optionGroupId) {
        return this.prisma.itemOption.findMany({
            where: { groupId: optionGroupId },
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    listOptionsByBranchId(branchId, client = this.prisma) {
        return client.itemOption.findMany({
            where: {
                group: {
                    menuItem: {
                        branchId,
                    },
                },
            },
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
            orderBy: [{ groupId: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createOption(data, client = this.prisma) {
        return client.itemOption.create({
            data,
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
    updateOption(id, data, client = this.prisma) {
        return client.itemOption.update({
            where: { id },
            data,
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
    async decrementTrackedOptionStock(optionId, quantity, client = this.prisma) {
        const result = await client.itemOption.updateMany({
            where: {
                id: optionId,
                isStockTracked: true,
                stockQuantity: {
                    not: null,
                    gte: quantity,
                },
            },
            data: {
                stockQuantity: {
                    decrement: quantity,
                },
            },
        });
        return result.count > 0;
    }
    async adjustTrackedOptionStock(optionId, delta, client = this.prisma) {
        if (delta === 0) {
            return true;
        }
        const result = await client.itemOption.updateMany({
            where: {
                id: optionId,
                isStockTracked: true,
                stockQuantity: delta < 0
                    ? {
                        not: null,
                        gte: Math.abs(delta),
                    }
                    : {
                        not: null,
                    },
            },
            data: {
                stockQuantity: delta < 0
                    ? {
                        decrement: Math.abs(delta),
                    }
                    : {
                        increment: delta,
                    },
            },
        });
        return result.count > 0;
    }
    incrementOptionStock(optionId, quantity, client = this.prisma) {
        return client.$executeRaw `
      UPDATE "ItemOption"
      SET "stockQuantity" = COALESCE("stockQuantity", 0) + ${quantity}
      WHERE "id" = ${optionId}
    `;
    }
    findHighestOptionSortOrderByOptionGroupId(optionGroupId, client = this.prisma) {
        return client.itemOption.findFirst({
            where: { groupId: optionGroupId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findVariantCombinationById(id, client = this.prisma) {
        return client.itemVariantCombination.findUnique({
            where: { id },
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
        });
    }
    listVariantCombinationsByMenuItemId(menuItemId, client = this.prisma) {
        return client.itemVariantCombination.findMany({
            where: { menuItemId },
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    listVariantCombinationsByMenuItemIds(menuItemIds, client = this.prisma) {
        return client.itemVariantCombination.findMany({
            where: { menuItemId: { in: menuItemIds }, isActive: true },
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
        });
    }
    findVariantCombinationByMenuItemIdAndSignature(menuItemId, signature, client = this.prisma) {
        return client.itemVariantCombination.findUnique({
            where: {
                menuItemId_signature: {
                    menuItemId,
                    signature,
                },
            },
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
        });
    }
    findActiveVariantCombinationByMenuItemIdAndSignature(menuItemId, signature, client = this.prisma) {
        return client.itemVariantCombination.findFirst({
            where: {
                menuItemId,
                signature,
                isActive: true,
            },
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
        });
    }
    createVariantCombination(data, client = this.prisma) {
        return client.itemVariantCombination.create({
            data,
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
        });
    }
    updateVariantCombination(id, data, client = this.prisma) {
        return client.itemVariantCombination.update({
            where: { id },
            data,
            include: item_variant_combination_ownership_entity_1.itemVariantCombinationOwnershipInclude,
        });
    }
    findHighestVariantCombinationSortOrderByMenuItemId(menuItemId, client = this.prisma) {
        return client.itemVariantCombination.findFirst({
            where: { menuItemId },
            select: {
                sortOrder: true,
            },
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async replaceVariantCombinationOptions(combinationId, optionIds, client = this.prisma) {
        await client.itemVariantCombinationOption.deleteMany({
            where: { combinationId },
        });
        if (optionIds.length > 0) {
            await client.itemVariantCombinationOption.createMany({
                data: optionIds.map((itemOptionId) => ({
                    combinationId,
                    itemOptionId,
                })),
            });
        }
    }
    async decrementTrackedVariantCombinationStock(combinationId, quantity, client = this.prisma) {
        const result = await client.itemVariantCombination.updateMany({
            where: {
                id: combinationId,
                isStockTracked: true,
                stockQuantity: {
                    not: null,
                    gte: quantity,
                },
            },
            data: {
                stockQuantity: {
                    decrement: quantity,
                },
            },
        });
        return result.count > 0;
    }
    incrementVariantCombinationStock(combinationId, quantity, client = this.prisma) {
        return client.$executeRaw `
      UPDATE "ItemVariantCombination"
      SET "stockQuantity" = COALESCE("stockQuantity", 0) + ${quantity}
      WHERE "id" = ${combinationId}
    `;
    }
    findItemInventoryLotById(id, client = this.prisma) {
        return client.menuItemInventoryLot.findUnique({
            where: { id },
            include: menu_item_inventory_lot_entity_1.menuItemInventoryLotInclude,
        });
    }
    findItemInventoryLotByMenuItemIdAndBatchNo(menuItemId, batchNo, client = this.prisma) {
        return client.menuItemInventoryLot.findUnique({
            where: {
                menuItemId_batchNo: {
                    menuItemId,
                    batchNo,
                },
            },
            include: menu_item_inventory_lot_entity_1.menuItemInventoryLotInclude,
        });
    }
    listItemInventoryLotsByMenuItemId(menuItemId, client = this.prisma) {
        return client.menuItemInventoryLot.findMany({
            where: { menuItemId },
            include: menu_item_inventory_lot_entity_1.menuItemInventoryLotInclude,
            orderBy: [{ expiryDate: 'asc' }, { receivedAt: 'asc' }, { createdAt: 'asc' }],
        });
    }
    createItemInventoryLot(data, client = this.prisma) {
        return client.menuItemInventoryLot.create({
            data,
            include: menu_item_inventory_lot_entity_1.menuItemInventoryLotInclude,
        });
    }
    updateItemInventoryLot(id, data, client = this.prisma) {
        return client.menuItemInventoryLot.update({
            where: { id },
            data,
            include: menu_item_inventory_lot_entity_1.menuItemInventoryLotInclude,
        });
    }
    countItemInventoryLotsByMenuItemId(menuItemId, client = this.prisma) {
        return client.menuItemInventoryLot.count({
            where: { menuItemId },
        });
    }
    countRemainingItemInventoryLotsByMenuItemId(menuItemId, client = this.prisma) {
        return client.menuItemInventoryLot.count({
            where: {
                menuItemId,
                remainingQuantity: {
                    gt: 0,
                },
            },
        });
    }
    async adjustItemInventoryLotQuantity(lotId, delta, client = this.prisma) {
        if (delta === 0) {
            return true;
        }
        const result = await client.menuItemInventoryLot.updateMany({
            where: {
                id: lotId,
                ...(delta < 0
                    ? {
                        remainingQuantity: {
                            gte: Math.abs(delta),
                        },
                    }
                    : {}),
            },
            data: {
                remainingQuantity: delta < 0
                    ? {
                        decrement: Math.abs(delta),
                    }
                    : {
                        increment: delta,
                    },
                ...(delta > 0
                    ? {
                        receivedQuantity: {
                            increment: delta,
                        },
                    }
                    : {}),
            },
        });
        return result.count > 0;
    }
    async decrementItemInventoryLotQuantity(lotId, quantity, client = this.prisma) {
        const result = await client.menuItemInventoryLot.updateMany({
            where: {
                id: lotId,
                remainingQuantity: {
                    gte: quantity,
                },
            },
            data: {
                remainingQuantity: {
                    decrement: quantity,
                },
            },
        });
        return result.count > 0;
    }
    incrementItemInventoryLotRemainingQuantity(lotId, quantity, client = this.prisma) {
        return client.$executeRaw `
      UPDATE "MenuItemInventoryLot"
      SET "remainingQuantity" = "remainingQuantity" + ${quantity}
      WHERE "id" = ${lotId}
    `;
    }
    findBranchCatalogByBranchId(branchId) {
        return this.prisma.branch.findUnique({
            where: { id: branchId },
            include: branch_catalog_entity_1.branchCatalogInclude,
        });
    }
    listApprovedStoreTypesByBranchId(branchId, client = this.prisma) {
        return client.branchStoreType.findMany({
            where: {
                branchId,
                status: client_1.BranchStoreTypeStatus.APPROVED,
                storeType: {
                    isActive: true,
                    deletedAt: null,
                },
            },
            include: approvedBranchStoreTypeInclude,
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async replaceCategoryStoreTypes(categoryId, storeTypeIds, client = this.prisma) {
        await client.menuCategoryStoreType.deleteMany({
            where: { categoryId },
        });
        if (storeTypeIds.length > 0) {
            await client.menuCategoryStoreType.createMany({
                data: storeTypeIds.map((storeTypeId) => ({
                    categoryId,
                    storeTypeId,
                })),
            });
        }
    }
    async replaceItemStoreTypes(itemId, storeTypeIds, client = this.prisma) {
        await client.menuItemStoreType.deleteMany({
            where: { itemId },
        });
        if (storeTypeIds.length > 0) {
            await client.menuItemStoreType.createMany({
                data: storeTypeIds.map((storeTypeId) => ({
                    itemId,
                    storeTypeId,
                })),
            });
        }
    }
    deleteCategory(id, client = this.prisma) {
        return client.menuCategory.delete({
            where: { id },
            include: menu_category_ownership_entity_1.menuCategoryOwnershipInclude,
        });
    }
    deleteItem(id, client = this.prisma) {
        return client.menuItem.delete({
            where: { id },
            include: menu_item_ownership_entity_1.menuItemOwnershipInclude,
        });
    }
    deleteOptionGroup(id, client = this.prisma) {
        return client.itemOptionGroup.delete({
            where: { id },
            include: item_option_group_ownership_entity_1.itemOptionGroupOwnershipInclude,
        });
    }
    deleteOption(id, client = this.prisma) {
        return client.itemOption.delete({
            where: { id },
            include: item_option_ownership_entity_1.itemOptionOwnershipInclude,
        });
    }
};
exports.MenusRepository = MenusRepository;
exports.MenusRepository = MenusRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusRepository);
//# sourceMappingURL=menus.repository.js.map