import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const menuCategoryOwnershipInclude: {
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
export type MenuCategoryOwnershipRecord = Prisma.MenuCategoryGetPayload<{
    include: typeof menuCategoryOwnershipInclude;
}>;
export declare class MenuCategoryOwnershipEntity {
    categoryId: string;
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    name: string;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
}
export declare function buildMenuCategoryOwnership(category: MenuCategoryOwnershipRecord): MenuCategoryOwnershipEntity;
