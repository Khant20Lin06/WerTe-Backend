import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const menuItemOwnershipInclude: {
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
    category: {
        select: {
            id: true;
            name: true;
            isActive: true;
        };
    };
    storeTypes: {
        include: {
            storeType: {
                select: {
                    id: true;
                    code: true;
                    name: true;
                    sortOrder: true;
                };
            };
        };
        orderBy: [{
            storeTypeId: "asc";
        }];
    };
};
export type MenuItemOwnershipRecord = Prisma.MenuItemGetPayload<{
    include: typeof menuItemOwnershipInclude;
}>;
export declare class MenuItemOwnershipEntity {
    itemId: string;
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    imageUrls: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    attributes?: Record<string, unknown> | null;
    basePrice: string;
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isAvailable: boolean;
    storeTypes: Array<{
        id: string;
        code: string;
        name: string;
        sortOrder: number;
    }>;
}
export declare function buildMenuItemOwnership(item: MenuItemOwnershipRecord): MenuItemOwnershipEntity;
