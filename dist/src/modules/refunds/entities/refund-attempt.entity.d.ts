import { PaymentProvider, Prisma, RefundStatus } from '@prisma/client';
export declare const refundAttemptSelect: {
    id: true;
    refundId: true;
    provider: true;
    status: true;
    providerReference: true;
    requestPayloadJson: true;
    responsePayloadJson: true;
    failureCode: true;
    failureMessage: true;
    attemptedAt: true;
    createdAt: true;
    updatedAt: true;
};
export type RefundAttemptRecord = Prisma.RefundAttemptGetPayload<{
    select: typeof refundAttemptSelect;
}>;
export declare class RefundAttemptEntity {
    refundAttemptId: string;
    refundId: string;
    provider: PaymentProvider;
    status: RefundStatus;
    providerReference: string | null;
    requestPayload: Prisma.JsonValue | null;
    responsePayload: Prisma.JsonValue | null;
    failureCode: string | null;
    failureMessage: string | null;
    attemptedAt: string;
    createdAt: string;
    updatedAt: string;
}
export declare function buildRefundAttemptEntity(attempt: RefundAttemptRecord): RefundAttemptEntity;
