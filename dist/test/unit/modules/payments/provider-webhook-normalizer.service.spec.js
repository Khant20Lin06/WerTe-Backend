"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const provider_webhook_normalizer_service_1 = require("../../../../src/modules/payments/services/provider-webhook-normalizer.service");
describe('ProviderWebhookNormalizerService', () => {
    it('normalizes payment provider callbacks into a stable payment event shape', () => {
        const service = new provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService();
        const result = service.normalizePaymentEvent({
            provider: client_1.PaymentProvider.STRIPE,
            payload: {
                id: 'evt_1',
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_123',
                        status: 'succeeded',
                        metadata: {
                            paymentId: 'payment_1',
                            orderId: 'order_1',
                        },
                    },
                },
            },
        });
        expect(result).toMatchObject({
            providerEventId: 'evt_1',
            eventType: 'payment_intent.succeeded',
            paymentId: 'payment_1',
            orderId: 'order_1',
            providerReference: 'pi_123',
            normalizedStatus: client_1.PaymentStatus.SUCCEEDED,
        });
    });
    it('normalizes refund provider callbacks into a stable refund event shape', () => {
        const service = new provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService();
        const result = service.normalizeRefundEvent({
            provider: client_1.PaymentProvider.STRIPE,
            payload: {
                id: 'evt_refund_1',
                type: 'refund.failed',
                data: {
                    object: {
                        id: 're_123',
                        status: 'failed',
                        metadata: {
                            refundId: 'refund_1',
                            paymentId: 'payment_1',
                            orderId: 'order_1',
                        },
                    },
                },
            },
        });
        expect(result).toMatchObject({
            providerEventId: 'evt_refund_1',
            eventType: 'refund.failed',
            refundId: 'refund_1',
            paymentId: 'payment_1',
            orderId: 'order_1',
            providerReference: 're_123',
            normalizedStatus: client_1.RefundStatus.FAILED,
        });
    });
});
//# sourceMappingURL=provider-webhook-normalizer.service.spec.js.map