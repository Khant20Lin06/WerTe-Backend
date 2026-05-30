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
    basePrice: string;
    sortOrder: number;
    isAvailable: boolean;
}
export declare function buildMenuItemOwnership(item: MenuItemOwnershipRecord): MenuItemOwnershipEntity;
