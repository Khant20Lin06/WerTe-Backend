import { RefundDetailEntity } from '../entities/refund-detail.entity';
import { RefundSummaryEntity } from '../entities/refund-summary.entity';
export declare class RefundSummaryDto {
    refundId: string;
    paymentId: string;
    orderId: string;
    createdByUserId: string | null;
    status: string;
    amount: string;
    currencyCode: string;
    idempotencyKey: string | null;
    providerReference: string | null;
    reasonCode: string | null;
    note: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    requestedAt: string;
    succeededAt: string | null;
    failedAt: string | null;
    cancelledAt: string | null;
    paymentMethod: string;
    paymentProvider: string;
    paymentStatus: string;
    paymentAmount: string;
    paymentRefundedAmount: string;
    createdByUserRole: string | null;
    createdByUserPhone: string | null;
    createdAt: string;
    updatedAt: string;
}
declare class RefundAttemptDto {
    refundAttemptId: string;
    refundId: string;
    provider: string;
    status: string;
    providerReference: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    attemptedAt: string;
    createdAt: string;
    updatedAt: string;
}
export declare class RefundDetailDto extends RefundSummaryDto {
    attempts: RefundAttemptDto[];
}
export declare function toRefundSummaryDto(refund: RefundSummaryEntity): RefundSummaryDto;
export declare function toRefundDetailDto(refund: RefundDetailEntity): RefundDetailDto;
export {};
