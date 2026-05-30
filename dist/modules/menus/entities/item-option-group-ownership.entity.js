"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemOptionGroupOwnershipEntity = exports.itemOptionGroupOwnershipInclude = void 0;
exports.buildItemOptionGroupOwnership = buildItemOptionGroupOwnership;
const client_1 = require("@prisma/client");
exports.itemOptionGroupOwnershipInclude = client_1.Prisma.validator()({
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
});
class ItemOptionGroupOwnershipEntity {
}
exports.ItemOptionGroupOwnershipEntity = ItemOptionGroupOwnershipEntity;
function buildItemOptionGroupOwnership(group) {
    return {
        optionGroupId: group.id,
        menuItemId: group.menuItem.id,
        branchId: group.menuItem.branch.id,
        merchantId: group.menuItem.branch.merchant.id,
        merchantUserId: group.menuItem.branch.merchant.user.id,
        phone: group.menuItem.branch.merchant.user.phone,
        role: group.menuItem.branch.merchant.user.role,
        userStatus: group.menuItem.branch.merchant.user.status,
        name: group.name,
        description: group.description,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
    };
}
//# sourceMappingURL=item-option-group-ownership.entity.js.map