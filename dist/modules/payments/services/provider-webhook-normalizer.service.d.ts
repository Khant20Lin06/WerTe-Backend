import { PaymentProvider, PaymentStatus, Prisma, RefundStatus } from '@prisma/client';
export type NormalizedPaymentProviderEvent = {
    providerEventId: string | null;
    eventType: string;
    paymentId: string | null;
    orderId: string | null;
    providerReference: string | null;
    normalizedStatus: PaymentStatus | null;
    normalizedPayloadJson: Prisma.InputJsonValue;
};
export type NormalizedRefundProviderEvent = {
    providerEventId: string | null;
    eventType: string;
    refundId: string | null;
    paymentId: string | null;
    orderId: string | null;
    providerReference: string | null;
    normalizedStatus: RefundStatus | null;
    normalizedPayloadJson: Prisma.InputJsonValue;
};
export declare class ProviderWebhookNormalizerService {
    normalizePaymentEvent(input: {
        provider: PaymentProvider;
        payload: Prisma.InputJsonValue;
    }): NormalizedPaymentProviderEvent;
    normalizeRefundEvent(input: {
        provider: PaymentProvider;
        payload: Prisma.InputJsonValue;
    }): NormalizedRefundProviderEvent;
    private extractDataObject;
    private extractMetadata;
    private normalizePaymentStatus;
    private normalizeRefundStatus;
    private containsAny;
    private readString;
    private asRecord;
    private buildNormalizedPayload;
}
