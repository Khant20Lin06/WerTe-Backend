import { Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const itemVariantCombinationOwnershipInclude: {
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
    optionLinks: {
        include: {
            itemOption: {
                select: {
                    id: true;
                    name: true;
                    sortOrder: true;
                    isActive: true;
                    group: {
                        select: {
                            id: true;
                            name: true;
                            sortOrder: true;
                            isActive: true;
                        };
                    };
                };
            };
        };
        orderBy: [{
            itemOptionId: "asc";
        }];
    };
};
export type ItemVariantCombinationOwnershipRecord = Prisma.ItemVariantCombinationGetPayload<{
    include: typeof itemVariantCombinationOwnershipInclude;
}>;
export declare class ItemVariantCombinationOwnershipEntity {
    combinationId: string;
    menuItemId: string;
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    name: string;
    sku?: string | null;
    isStockTracked: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number | null;
    isInStock: boolean;
    isLowStock: boolean;
    sortOrder: number;
    isActive: boolean;
    selectedOptions: Array<{
        optionId: string;
        optionName: string;
        optionSortOrder: number;
        optionGroupId: string;
        optionGroupName: string;
        optionGroupSortOrder: number;
    }>;
}
export declare function buildItemVariantCombinationOwnership(combination: ItemVariantCombinationOwnershipRecord): ItemVariantCombinationOwnershipEntity;
