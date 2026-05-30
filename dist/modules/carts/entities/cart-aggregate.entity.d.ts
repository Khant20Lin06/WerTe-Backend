import { BranchStatus, CartStatus, MerchantStatus, Prisma } from '@prisma/client';
export declare const cartAggregateInclude: {
    customerProfile: {
        select: {
            id: true;
            userId: true;
        };
    };
    branch: {
        select: {
            id: true;
            merchantId: true;
            name: true;
            status: true;
            merchant: {
                select: {
                    id: true;
                    status: true;
                };
            };
        };
    };
    items: {
        orderBy: [{
            createdAt: "asc";
        }, {
            id: "asc";
        }];
        include: {
            menuItem: {
                select: {
                    id: true;
                    branchId: true;
                    categoryId: true;
                    name: true;
                    description: true;
                    imageUrl: true;
                    basePrice: true;
                    isAvailable: true;
                };
            };
            selectedOptions: {
                orderBy: [{
                    createdAt: "asc";
                }, {
                    id: "asc";
                }];
                include: {
                    itemOption: {
                        select: {
                            id: true;
                            name: true;
                            isActive: true;
                            group: {
                                select: {
                                    id: true;
                                    name: true;
                                    isActive: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export type CartAggregateRecord = Prisma.CartGetPayload<{
    include: typeof cartAggregateInclude;
}>;
export declare class CartAggregateSelectedOptionEntity {
    cartItemOptionId: string;
    itemOptionId: string;
    itemOptionName: string;
    itemOptionIsActive: boolean;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupIsActive: boolean;
    nameSnapshot: string;
    priceDeltaSnapshot: string;
}
export declare class CartAggregateItemEntity {
    cartItemId: string;
    menuItemId: string;
    branchId: string;
    categoryId?: string | null;
    menuItemName: string;
    menuItemDescription?: string | null;
    menuItemImageUrl?: string | null;
    menuItemBasePrice: string;
    menuItemIsAvailable: boolean;
    quantity: number;
    unitPriceSnapshot: string;
    lineTotal: string;
    selectedOptions: CartAggregateSelectedOptionEntity[];
}
export declare class CartAggregateEntity {
    cartId: string | null;
    customerProfileId: string | null;
    branchId: string;
    merchantId: string | null;
    branchName: string | null;
    branchStatus: BranchStatus | null;
    merchantStatus: MerchantStatus | null;
    status: CartStatus;
    totalQuantity: number;
    subtotalAmount: string;
    totalAmount: string;
    isEmpty: boolean;
    items: CartAggregateItemEntity[];
}
type BuildEmptyCartAggregateInput = {
    branchId: string;
};
export declare function buildCartAggregate(cart: CartAggregateRecord): CartAggregateEntity;
export declare function buildEmptyCartAggregate(input: BuildEmptyCartAggregateInput): CartAggregateEntity;
export {};
