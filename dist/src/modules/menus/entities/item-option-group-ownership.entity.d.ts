import { ItemOptionGroupKind, Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const itemOptionGroupOwnershipInclude: {
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
export type ItemOptionGroupOwnershipRecord = Prisma.ItemOptionGroupGetPayload<{
    include: typeof itemOptionGroupOwnershipInclude;
}>;
export declare class ItemOptionGroupOwnershipEntity {
    optionGroupId: string;
    menuItemId: string;
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    name: string;
    description?: string | null;
    kind: ItemOptionGroupKind;
    minSelect: number;
    maxSelect: number;
    sortOrder: number;
    isActive: boolean;
}
export declare function buildItemOptionGroupOwnership(group: ItemOptionGroupOwnershipRecord): ItemOptionGroupOwnershipEntity;
