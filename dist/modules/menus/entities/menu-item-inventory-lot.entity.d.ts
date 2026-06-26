import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const menuItemInventoryLotInclude: {
    menuItem: {
        select: {
            id: true;
            name: true;
            isStockTracked: true;
            stockQuantity: true;
            lowStockThreshold: true;
            branch: {
                select: {
                    id: true;
                    merchantId: true;
                    merchant: {
                        select: {
                            id: true;
                            user: {
                                select: {
                                    id: true;
                                    phone: true;
                                    role: true;
                                    status: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export type MenuItemInventoryLotRecord = Prisma.MenuItemInventoryLotGetPayload<{
    include: typeof menuItemInventoryLotInclude;
}>;
export declare class MenuItemInventoryLotEntity {
    lotId: string;
    menuItemId: string;
    menuItemName: string;
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    batchNo: string;
    expiryDate: string | null;
    receivedAt: string;
    receivedQuantity: number;
    remainingQuantity: number;
    note: string | null;
    isExpired: boolean;
    isDepleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function buildMenuItemInventoryLot(lot: MenuItemInventoryLotRecord): MenuItemInventoryLotEntity;
