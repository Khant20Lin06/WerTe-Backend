import { CheckoutSubmissionEntity } from '../entities/checkout-submission.entity';
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
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
    placedAt: string;
    isIdempotentReplay: boolean;
}
export declare function toCheckoutSubmissionDto(submission: CheckoutSubmissionEntity): CheckoutSubmissionDto;
