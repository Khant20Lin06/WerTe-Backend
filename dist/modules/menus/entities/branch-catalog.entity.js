"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchCatalogEntity = exports.CatalogMenuCategoryEntity = exports.CatalogMenuItemEntity = exports.CatalogOptionGroupEntity = exports.CatalogOptionEntity = exports.branchCatalogInclude = void 0;
exports.buildBranchCatalog = buildBranchCatalog;
const client_1 = require("@prisma/client");
exports.branchCatalogInclude = client_1.Prisma.validator()({
    merchant: {
        select: {
            id: true,
            name: true,
            status: true,
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
    menuCategories: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
            menuItems: {
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
                include: {
                    optionGroups: {
                        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
                        include: {
                            options: {
                                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
                            },
                        },
                    },
                },
            },
        },
    },
    menuItems: {
        where: {
            categoryId: null,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
            optionGroups: {
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
                include: {
                    options: {
                        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
                    },
                },
            },
        },
    },
});
class CatalogOptionEntity {
}
exports.CatalogOptionEntity = CatalogOptionEntity;
class CatalogOptionGroupEntity {
}
exports.CatalogOptionGroupEntity = CatalogOptionGroupEntity;
class CatalogMenuItemEntity {
}
exports.CatalogMenuItemEntity = CatalogMenuItemEntity;
class CatalogMenuCategoryEntity {
}
exports.CatalogMenuCategoryEntity = CatalogMenuCategoryEntity;
class BranchCatalogEntity {
}
exports.BranchCatalogEntity = BranchCatalogEntity;
function buildBranchCatalog(branch, options) {
    const activeOnly = options?.activeOnly ?? false;
    const buildOption = (option) => ({
        optionId: option.id,
        name: option.name,
        priceDelta: option.priceDelta.toString(),
        sortOrder: option.sortOrder,
        isActive: option.isActive,
    });
    const buildOptionGroup = (group) => ({
        optionGroupId: group.id,
        name: group.name,
        description: group.description,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
        options: group.options
            .filter((option) => !activeOnly || option.isActive)
            .map((option) => buildOption(option)),
    });
    const buildMenuItem = (item) => ({
        itemId: item.id,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        basePrice: item.basePrice.toString(),
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        optionGroups: item.optionGroups
            .filter((group) => !activeOnly || group.isActive)
            .map((group) => buildOptionGroup(group)),
    });
    const categories = branch.menuCategories
        .filter((category) => !activeOnly || category.isActive)
        .map((category) => ({
        categoryId: category.id,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        items: category.menuItems
            .filter((item) => !activeOnly || item.isAvailable)
            .map((item) => buildMenuItem(item)),
    }));
    const uncategorizedItems = branch.menuItems
        .filter((item) => !activeOnly || item.isAvailable)
        .map((item) => buildMenuItem(item));
    return {
        branchId: branch.id,
        merchantId: branch.merchant.id,
        merchantUserId: branch.merchant.user.id,
        branchName: branch.name,
        township: branch.township,
        branchStatus: branch.status,
        categories,
        uncategorizedItems,
    };
}
//# sourceMappingURL=branch-catalog.entity.js.map