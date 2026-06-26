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
    storeTypes: {
        include: {
            storeType: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    sortOrder: true,
                },
            },
        },
        orderBy: [{ storeTypeId: 'asc' }],
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
        imageUrls: toStringArray(item.imageUrlsJson),
        sku: item.sku,
        barcode: item.barcode,
        brand: item.brand,
        attributes: toJsonObject(item.attributesJson),
        basePrice: item.basePrice.toString(),
        isStockTracked: item.isStockTracked,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
        isInStock: isInStock(item),
        isLowStock: isLowStock(item),
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable,
        storeTypes: item.storeTypes.map((assignment) => ({
            id: assignment.storeType.id,
            code: assignment.storeType.code,
            name: assignment.storeType.name,
            sortOrder: assignment.storeType.sortOrder,
        })),
    };
}
function isInStock(item) {
    if (!item.isStockTracked) {
        return true;
    }
    return (item.stockQuantity ?? 0) > 0;
}
function isLowStock(item) {
    if (!item.isStockTracked || item.stockQuantity === null || item.lowStockThreshold === null) {
        return false;
    }
    return item.stockQuantity <= item.lowStockThreshold;
}
function toStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string');
}
function toJsonObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value;
}
//# sourceMappingURL=menu-item-ownership.entity.js.map