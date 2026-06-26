import { BranchStatus, CartStatus, MerchantStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const cartItemOptionOwnershipInclude: {
    cartItem: {
        select: {
            id: true;
            cartId: true;
            cart: {
                select: {
                    id: true;
                    customerProfileId: true;
                    branchId: true;
                    status: true;
                    customerProfile: {
                        select: {
                            id: true;
                            userId: true;
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
                    branch: {
                        select: {
                            id: true;
                            merchantId: true;
                            status: true;
                            merchant: {
                                select: {
                                    id: true;
                                    status: true;
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
                    menuItem: {
                        select: {
                            id: true;
                            branchId: true;
                            name: true;
                            isAvailable: true;
                            branch: {
                                select: {
                                    id: true;
                                    merchantId: true;
                                    status: true;
                                    merchant: {
                                        select: {
                                            id: true;
                                            status: true;
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
    };
};
export type CartItemOptionOwnershipRecord = Prisma.CartItemOptionGetPayload<{
    include: typeof cartItemOptionOwnershipInclude;
}>;
export declare class CartItemOptionOwnershipEntity {
    cartItemOptionId: string;
    cartItemId: string;
    cartId: string;
    customerProfileId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    branchId: string;
    merchantId: string;
    merchantStatus: MerchantStatus;
    branchStatus: BranchStatus;
    cartStatus: CartStatus;
    itemOptionId: string;
    itemOptionName: string;
    itemOptionIsActive: boolean;
    optionGroupId: string;
    optionGroupName: string;
    optionGroupIsActive: boolean;
    menuItemId: string;
    menuItemName: string;
    menuItemIsAvailable: boolean;
    nameSnapshot: string;
    priceDeltaSnapshot: string;
}
export declare function buildCartItemOptionOwnership(cartItemOption: CartItemOptionOwnershipRecord): CartItemOptionOwnershipEntity;
