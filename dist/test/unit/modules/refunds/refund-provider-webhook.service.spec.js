"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const refund_provider_webhook_service_1 = require("../../../../src/modules/refunds/services/refund-provider-webhook.service");
const provider_webhook_normalizer_service_1 = require("../../../../src/modules/payments/services/provider-webhook-normalizer.service");
function makeRefundProviderEventRecord(overrides) {
    return {
        id: 'refund_provider_event_1',
        provider: client_1.PaymentProvider.STRIPE,
        providerEventId: 'evt_refund_1',
        eventType: 'refund.succeeded',
        refundId: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 're_123',
        normalizedStatus: client_1.RefundStatus.SUCCEEDED,
        verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
        processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        signatureHeader: 'v1=signature',
        headersJson: { 'stripe-signature': 'v1=signature' },
        rawPayloadJson: { id: 'evt_refund_1' },
        normalizedPayloadJson: { refundId: 'refund_1' },
        processingMetadataJson: null,
        failureCode: null,
        failureMessage: null,
        receivedAt: new Date('2026-04-25T09:00:00.000Z'),
        processedAt: null,
        failedAt: null,
        ignoredAt: null,
        createdAt: new Date('2026-04-25T09:00:00.000Z'),
        updatedAt: new Date('2026-04-25T09:00:00.000Z'),
        ...overrides,
    };
}
describe('RefundProviderWebhookService', () => {
    it('persists verified refund provider webhooks with normalized fields', async () => {
        const refundsRepository = {
            findRefundProviderEventByProviderEventId: jest.fn().mockResolvedValue(null),
            createRefundProviderEvent: jest
                .fn()
                .mockResolvedValue(makeRefundProviderEventRecord()),
        };
        const service = new refund_provider_webhook_service_1.RefundProviderWebhookService(refundsRepository, new provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService(), {
            verifySignature: jest.fn().mockReturnValue({
                status: client_1.ProviderEventVerificationStatus.VERIFIED,
                failureCode: null,
                failureMessage: null,
            }),
        });
        const result = await service.ingestRefundWebhook({
            provider: client_1.PaymentProvider.STRIPE,
            payload: {
                id: 'evt_refund_1',
                type: 'refund.succeeded',
                data: {
                    object: {
                        id: 're_123',
                        status: 'succeeded',
                        metadata: {
                            refundId: 'refund_1',
                            paymentId: 'payment_1',
                            orderId: 'order_1',
                        },
                    },
                },
            },
        });
        expect(refundsRepository.createRefundProviderEvent).toHaveBeenCalledWith(expect.objectContaining({
            provider: client_1.PaymentProvider.STRIPE,
            providerEventId: 'evt_refund_1',
            eventType: 'refund.succeeded',
            refundId: 'refund_1',
            paymentId: 'payment_1',
            orderId: 'order_1',
            providerReference: 're_123',
            normalizedStatus: client_1.RefundStatus.SUCCEEDED,
            verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        }));
        expect(result).toMatchObject({
            refundProviderEventId: 'refund_provider_event_1',
            normalizedStatus: client_1.RefundStatus.SUCCEEDED,
        });
    });
});
//# sourceMappingURL=refund-provider-webhook.service.spec.js.map