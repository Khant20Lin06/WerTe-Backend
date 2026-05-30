import { BranchStatus, CartStatus, MerchantStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const cartItemOwnershipInclude: {
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
    menuItem: {
        select: {
            id: true;
            branchId: true;
            categoryId: true;
            name: true;
            basePrice: true;
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
export type CartItemOwnershipRecord = Prisma.CartItemGetPayload<{
    include: typeof cartItemOwnershipInclude;
}>;
export declare class CartItemOwnershipEntity {
    cartItemId: string;
    cartId: string;
    customerProfileId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    branchId: string;
    cartStatus: CartStatus;
    branchStatus: BranchStatus;
    merchantId: string;
    merchantStatus: MerchantStatus;
    menuItemId: string;
    menuItemBranchId: string;
    menuItemCategoryId?: string | null;
    menuItemName: string;
    menuItemBasePrice: string;
    menuItemIsAvailable: boolean;
    quantity: number;
    unitPriceSnapshot: string;
    lineTotal: string;
}
export declare function buildCartItemOwnership(cartItem: CartItemOwnershipRecord): CartItemOwnershipEntity;
