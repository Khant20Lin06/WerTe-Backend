"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemInventoryLotEntity = exports.menuItemInventoryLotInclude = void 0;
exports.buildMenuItemInventoryLot = buildMenuItemInventoryLot;
const client_1 = require("@prisma/client");
exports.menuItemInventoryLotInclude = client_1.Prisma.validator()({
    menuItem: {
        select: {
            id: true,
            name: true,
            isStockTracked: true,
            stockQuantity: true,
            lowStockThreshold: true,
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
class MenuItemInventoryLotEntity {
}
exports.MenuItemInventoryLotEntity = MenuItemInventoryLotEntity;
function buildMenuItemInventoryLot(lot) {
    return {
        lotId: lot.id,
        menuItemId: lot.menuItem.id,
        menuItemName: lot.menuItem.name,
        branchId: lot.menuItem.branch.id,
        merchantId: lot.menuItem.branch.merchant.id,
        merchantUserId: lot.menuItem.branch.merchant.user.id,
        phone: lot.menuItem.branch.merchant.user.phone,
        role: lot.menuItem.branch.merchant.user.role,
        userStatus: lot.menuItem.branch.merchant.user.status,
        batchNo: lot.batchNo,
        expiryDate: lot.expiryDate?.toISOString() ?? null,
        receivedAt: lot.receivedAt.toISOString(),
        receivedQuantity: lot.receivedQuantity,
        remainingQuantity: lot.remainingQuantity,
        note: lot.note ?? null,
        isExpired: lot.expiryDate !== null && lot.expiryDate.getTime() < Date.now(),
        isDepleted: lot.remainingQuantity <= 0,
        createdAt: lot.createdAt.toISOString(),
        updatedAt: lot.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=menu-item-inventory-lot.entity.js.map