import { PaymentDetailEntity } from '../entities/payment-detail.entity';
import { PaymentSummaryEntity } from '../entities/payment-summary.entity';
declare class PaymentRelatedRefundDto {
    refundId: string;
    status: string;
    amount: string;
    currencyCode: string;
    providerReference: string | null;
    reasonCode: string | null;
    note: string | null;
    requestedAt: string;
    succeededAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    createdByUserId: string | null;
    createdByUserRole: string | null;
    createdByUserPhone: string | null;
}
export declare class PaymentSummaryDto {
    paymentId: string;
    orderId: string;
    customerProfileId: string;
    method: string;
    provider: string;
    status: string;
    amount: string;
    refundedAmount: string;
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
    createdAt: string;
    updatedAt: string;
    refunds: PaymentRelatedRefundDto[];
}
declare class PaymentAttemptDto {
    paymentAttemptId: string;
    paymentId: string;
    provider: string;
    status: string;
    providerReference: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    attemptedAt: string;
    createdAt: string;
    updatedAt: string;
}
export declare class PaymentDetailDto extends PaymentSummaryDto {
    attempts: PaymentAttemptDto[];
}
export declare function toPaymentSummaryDto(payment: PaymentSummaryEntity): PaymentSummaryDto;
export declare function toPaymentDetailDto(payment: PaymentDetailEntity): PaymentDetailDto;
export {};
