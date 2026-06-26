import { PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
export declare const paymentAttemptSelect: {
    id: true;
    paymentId: true;
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
export type PaymentAttemptRecord = Prisma.PaymentAttemptGetPayload<{
    select: typeof paymentAttemptSelect;
}>;
export declare class PaymentAttemptEntity {
    paymentAttemptId: string;
    paymentId: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    providerReference: string | null;
    requestPayload: Prisma.JsonValue | null;
    responsePayload: Prisma.JsonValue | null;
    failureCode: string | null;
    failureMessage: string | null;
    attemptedAt: string;
    createdAt: string;
    updatedAt: string;
}
export declare function buildPaymentAttemptEntity(attempt: PaymentAttemptRecord): PaymentAttemptEntity;
