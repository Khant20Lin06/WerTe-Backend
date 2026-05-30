"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemOwnershipEntity = exports.menuItemOwnershipInclude = void 0;
exports.buildMenuItemOwnership = buildMenuItemOwnership;
const client_1 = require("@prisma/client");
exports.menuItemOwnershipInclude = client_1.Prisma.validator()({
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
    category: {
        select: {
            id: true,
            name: true,
            isActive: true,
        },
    },
});
class MenuItemOwnershipEntity {
}
exports.MenuItemOwnershipEntity = MenuItemOwnershipEntity;
function buildMenuItemOwnership(item) {
    return {
        itemId: item.id,
        branchId: item.branch.id,
        merchantId: item.branch.merchant.id,
        merchantUserId: item.branch.merchant.user.id,
        phone: item.branch.merchant.user.phone,
        role: item.branch.merchant.user.role,
        userStatus: item.branch.merchant.user.status,
        categoryId: item.category?.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        basePrice: item.basePrice.toString(),
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
    };
}
//# sourceMappingURL=menu-item-ownership.entity.js.map