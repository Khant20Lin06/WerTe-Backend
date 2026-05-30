"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuCategoryOwnershipEntity = exports.menuCategoryOwnershipInclude = void 0;
exports.buildMenuCategoryOwnership = buildMenuCategoryOwnership;
const client_1 = require("@prisma/client");
exports.menuCategoryOwnershipInclude = client_1.Prisma.validator()({
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
});
class MenuCategoryOwnershipEntity {
}
exports.MenuCategoryOwnershipEntity = MenuCategoryOwnershipEntity;
function buildMenuCategoryOwnership(category) {
    return {
        categoryId: category.id,
        branchId: category.branch.id,
        merchantId: category.branch.merchant.id,
        merchantUserId: category.branch.merchant.user.id,
        phone: category.branch.merchant.user.phone,
        role: category.branch.merchant.user.role,
        userStatus: category.branch.merchant.user.status,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
    };
}
//# sourceMappingURL=menu-category-ownership.entity.js.map