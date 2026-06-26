import { OrderStatus, Prisma } from '@prisma/client';
import { CheckoutPaymentIntentEntity } from '../../payments/entities/checkout-payment-intent.entity';
import { AppliedPromotionEntity } from '../../promotions/entities/applied-promotion.entity';
export declare const checkoutSubmissionSelect: {
    id: true;
    orderCode: true;
    customerProfileId: true;
    branchId: true;
    addressId: true;
    cartId: true;
    idempotencyKey: true;
    promotionId: true;
    promotionCodeSnapshot: true;
    promotionNameSnapshot: true;
    promotionDiscountTypeSnapshot: true;
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
    appliedPromotion?: AppliedPromotionEntity | null;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    isIdempotentReplay: boolean;
    paymentIntent: CheckoutPaymentIntentEntity;
}
export declare function buildCheckoutSubmission(order: CheckoutSubmissionRecord, options?: {
    isIdempotentReplay?: boolean;
    paymentIntent?: CheckoutPaymentIntentEntity;
}): CheckoutSubmissionEntity;
