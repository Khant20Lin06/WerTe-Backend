"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemVariantCombinationOwnershipEntity = exports.itemVariantCombinationOwnershipInclude = void 0;
exports.buildItemVariantCombinationOwnership = buildItemVariantCombinationOwnership;
const client_1 = require("@prisma/client");
exports.itemVariantCombinationOwnershipInclude = client_1.Prisma.validator()({
    menuItem: {
        include: {
            branch: {
                select: {
                    id: true,
                    merchantId: true,
                    merchant: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    phone: true,
                                    role: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    optionLinks: {
        include: {
            itemOption: {
                select: {
                    id: true,
                    name: true,
                    sortOrder: true,
                    isActive: true,
                    group: {
                        select: {
                            id: true,
                            name: true,
                            sortOrder: true,
                            isActive: true,
                        },
                    },
                },
            },
        },
        orderBy: [{ itemOptionId: 'asc' }],
    },
});
class ItemVariantCombinationOwnershipEntity {
}
exports.ItemVariantCombinationOwnershipEntity = ItemVariantCombinationOwnershipEntity;
function buildItemVariantCombinationOwnership(combination) {
    return {
        combinationId: combination.id,
        menuItemId: combination.menuItem.id,
        branchId: combination.menuItem.branch.id,
        merchantId: combination.menuItem.branch.merchant.id,
        merchantUserId: combination.menuItem.branch.merchant.user.id,
        phone: combination.menuItem.branch.merchant.user.phone,
        role: combination.menuItem.branch.merchant.user.role,
        userStatus: combination.menuItem.branch.merchant.user.status,
        name: combination.name,
        sku: combination.sku,
        isStockTracked: combination.isStockTracked,
        stockQuantity: combination.stockQuantity,
        lowStockThreshold: combination.lowStockThreshold,
        isInStock: isInStock(combination),
        isLowStock: isLowStock(combination),
        sortOrder: combination.sortOrder,
        isActive: combination.isActive,
        selectedOptions: [...combination.optionLinks]
            .sort((left, right) => left.itemOption.group.sortOrder - right.itemOption.group.sortOrder ||
            left.itemOption.sortOrder - right.itemOption.sortOrder ||
            left.itemOption.id.localeCompare(right.itemOption.id))
            .map((link) => ({
            optionId: link.itemOption.id,
            optionName: link.itemOption.name,
            optionSortOrder: link.itemOption.sortOrder,
            optionGroupId: link.itemOption.group.id,
            optionGroupName: link.itemOption.group.name,
            optionGroupSortOrder: link.itemOption.group.sortOrder,
        })),
    };
}
function isInStock(combination) {
    if (!combination.isStockTracked) {
        return true;
    }
    return (combination.stockQuantity ?? 0) > 0;
}
function isLowStock(combination) {
    if (!combination.isStockTracked ||
        combination.stockQuantity === null ||
        combination.lowStockThreshold === null) {
        return false;
    }
    return combination.stockQuantity <= combination.lowStockThreshold;
}
//# sourceMappingURL=item-variant-combination-ownership.entity.js.map