import { OrderStatus, Prisma } from '@prisma/client';
export declare const checkoutSubmissionSelect: {
    id: true;
    orderCode: true;
    customerProfileId: true;
    branchId: true;
    addressId: true;
    cartId: true;
    idempotencyKey: true;
    status: true;
    currencyCode: true;
    subtotalAmount: true;
    discountAmount: true;
    deliveryFee: true;
    totalAmount: true;
    placedAt: true;
};
export type CheckoutSubmissionRecord = Prisma.OrderGetPayload<{
    select: typeof checkoutSubmissionSelect;
}>;
export declare class CheckoutSubmissionEntity {
    orderId: string;
    orderCode: string;
    customerProfileId: string;
    branchId: string;
    addressId: string | null;
    cartId: string | null;
    idempotencyKey: string | null;
    status: OrderStatus;
    currencyCode: string;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    isIdempotentReplay: boolean;
}
export declare function buildCheckoutSubmission(order: CheckoutSubmissionRecord, options?: {
    isIdempotentReplay?: boolean;
}): CheckoutSubmissionEntity;
