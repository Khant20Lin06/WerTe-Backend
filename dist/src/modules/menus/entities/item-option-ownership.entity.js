"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOptionOwnershipEntity = exports.itemOptionOwnershipInclude = void 0;
exports.buildItemOptionOwnership = buildItemOptionOwnership;
const client_1 = require("@prisma/client");
exports.itemOptionOwnershipInclude = client_1.Prisma.validator()({
    group: {
        include: {
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
        },
    },
});
class ItemOptionOwnershipEntity {
}
exports.ItemOptionOwnershipEntity = ItemOptionOwnershipEntity;
function buildItemOptionOwnership(option) {
    return {
        optionId: option.id,
        optionGroupId: option.group.id,
        menuItemId: option.group.menuItem.id,
        branchId: option.group.menuItem.branch.id,
        merchantId: option.group.menuItem.branch.merchant.id,
        merchantUserId: option.group.menuItem.branch.merchant.user.id,
        phone: option.group.menuItem.branch.merchant.user.phone,
        role: option.group.menuItem.branch.merchant.user.role,
        userStatus: option.group.menuItem.branch.merchant.user.status,
        name: option.name,
        priceDelta: option.priceDelta.toString(),
        isStockTracked: option.isStockTracked,
        stockQuantity: option.stockQuantity,
        lowStockThreshold: option.lowStockThreshold,
        isInStock: isInStock(option),
        isLowStock: isLowStock(option),
        sortOrder: option.sortOrder,
        isActive: option.isActive,
    };
}
function isInStock(option) {
    if (!option.isStockTracked) {
        return true;
    }
    return (option.stockQuantity ?? 0) > 0;
}
function isLowStock(option) {
    if (!option.isStockTracked ||
        option.stockQuantity === null ||
        option.lowStockThreshold === null) {
        return false;
    }
    return option.stockQuantity <= option.lowStockThreshold;
}
//# sourceMappingURL=item-option-ownership.entity.js.map