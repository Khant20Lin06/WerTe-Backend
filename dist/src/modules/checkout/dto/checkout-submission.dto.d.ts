import { CheckoutSubmissionEntity } from '../entities/checkout-submission.entity';
import { AppliedPromotionDto } from '../../promotions/dto/applied-promotion.dto';
export declare class CheckoutPaymentIntentDto {
    paymentId: string;
    orderId: string;
    customerProfileId: string;
    method: string;
    provider: string;
    status: string;
    amount: string;
    currencyCode: string;
    idempotencyKey: string | null;
    providerReference: string | null;
    providerReceiptId: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    requiresActionAt: string | null;
    succeededAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    expiredAt: string | null;
    requiresCustomerAction: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare class CheckoutSubmissionDto {
    orderId: string;
    orderCode: string;
    customerProfileId: string;
    branchId: string;
    addressId: string | null;
    cartId: string | null;
    idempotencyKey: string | null;
    status: string;
    currencyCode: string;
    appliedPromotion?: AppliedPromotionDto | null;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    isIdempotentReplay: boolean;
    paymentIntent: CheckoutPaymentIntentDto;
}
export declare function toCheckoutSubmissionDto(submission: CheckoutSubmissionEntity): CheckoutSubmissionDto;
