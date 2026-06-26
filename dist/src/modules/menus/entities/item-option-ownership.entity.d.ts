import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const itemOptionOwnershipInclude: {
    group: {
        include: {
            menuItem: {
                include: {
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
    };
};
export type ItemOptionOwnershipRecord = Prisma.ItemOptionGetPayload<{
    include: typeof itemOptionOwnershipInclude;
}>;
export declare class ItemOptionOwnershipEntity {
    optionId: string;
    optionGroupId: string;
    menuItemId: string;
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    name: string;
    priceDelta: string;
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
}
export declare function buildItemOptionOwnership(option: ItemOptionOwnershipRecord): ItemOptionOwnershipEntity;
