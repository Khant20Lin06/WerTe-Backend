import { BranchStatus, CartStatus, MerchantStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
export declare const cartOwnershipInclude: {
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
export type CartOwnershipRecord = Prisma.CartGetPayload<{
    include: typeof cartOwnershipInclude;
}>;
export declare class CartOwnershipEntity {
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
    status: CartStatus;
    totalQuantity: number;
    subtotalAmount: string;
    totalAmount: string;
}
export declare function buildCartOwnership(cart: CartOwnershipRecord): CartOwnershipEntity;
