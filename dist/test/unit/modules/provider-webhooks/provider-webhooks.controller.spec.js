"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../../../src/common/decorators/public.decorator");
const provider_webhooks_controller_1 = require("../../../../src/modules/provider-webhooks/controllers/provider-webhooks.controller");
function makePaymentProviderEvent(overrides) {
    return {
        paymentProviderEventId: 'payment_provider_event_1',
        provider: client_1.PaymentProvider.STRIPE,
        providerEventId: 'evt_1',
        eventType: 'payment_intent.succeeded',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 'pi_123',
        normalizedStatus: client_1.PaymentStatus.SUCCEEDED,
        verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
        processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
        signatureHeader: 'v1=signature',
        headers: { 'stripe-signature': 'v1=signature' },
        rawPayload: { id: 'evt_1' },
        normalizedPayload: { paymentId: 'payment_1' },
        processingMetadata: null,
        failureCode: null,
        failureMessage: null,
        receivedAt: '2026-04-25T08:00:00.000Z',
        processedAt: '2026-04-25T08:01:00.000Z',
        failedAt: null,
        ignoredAt: null,
        createdAt: '2026-04-25T08:00:00.000Z',
        updatedAt: '2026-04-25T08:01:00.000Z',
        ...overrides,
    };
}
function makeRefundProviderEvent(overrides) {
    return {
        refundProviderEventId: 'refund_provider_event_1',
        provider: client_1.PaymentProvider.STRIPE,
        providerEventId: 'evt_refund_1',
        eventType: 'refund.succeeded',
        refundId: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 're_123',
        normalizedStatus: client_1.RefundStatus.SUCCEEDED,
        verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
        processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
        signatureHeader: 'v1=signature',
        headers: { 'stripe-signature': 'v1=signature' },
        rawPayload: { id: 'evt_refund_1' },
        normalizedPayload: { refundId: 'refund_1' },
        processingMetadata: null,
        failureCode: null,
        failureMessage: null,
        receivedAt: '2026-04-25T09:00:00.000Z',
        processedAt: '2026-04-25T09:01:00.000Z',
        failedAt: null,
        ignoredAt: null,
        createdAt: '2026-04-25T09:00:00.000Z',
        updatedAt: '2026-04-25T09:01:00.000Z',
        ...overrides,
    };
}
function makeController() {
    const paymentProviderWebhookService = {
        ingestPaymentWebhook: jest
            .fn()
            .mockResolvedValue(makePaymentProviderEvent({
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
            processedAt: null,
        })),
    };
    const refundProviderWebhookService = {
        ingestRefundWebhook: jest
            .fn()
            .mockResolvedValue(makeRefundProviderEvent({
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
            processedAt: null,
        })),
    };
    const providerWebhookSecretsService = {
        resolveSigningSecret: jest.fn().mockReturnValue('webhook-secret'),
    };
    const queueService = {
        add: jest.fn().mockResolvedValue({ id: 'job_1' }),
    };
    return {
        controller: new provider_webhooks_controller_1.ProviderWebhooksController(paymentProviderWebhookService, refundProviderWebhookService, providerWebhookSecretsService, queueService),
        paymentProviderWebhookService,
        refundProviderWebhookService,
        providerWebhookSecretsService,
        queueService,
    };
}
describe('ProviderWebhooksController', () => {
    it('is public so provider callbacks can bypass JWT authentication', () => {
        expect(Reflect.getMetadata(public_decorator_1.IS_PUBLIC_KEY, provider_webhooks_controller_1.ProviderWebhooksController)).toBe(true);
    });
    it('ingests and queues payment provider webhooks', async () => {
        const { controller, paymentProviderWebhookService, providerWebhookSecretsService, queueService, } = makeController();
        const payload = {
            id: 'evt_1',
            type: 'payment_intent.succeeded',
        };
        const result = await controller.receivePaymentWebhook(client_1.PaymentProvider.STRIPE, payload, {
            'stripe-signature': 'v1=signature',
            'x-request-id': ['req_1', 'req_2'],
        }, {
            rawBody: Buffer.from(JSON.stringify(payload)),
        });
        expect(providerWebhookSecretsService.resolveSigningSecret).toHaveBeenCalledWith(client_1.PaymentProvider.STRIPE, 'payment');
        expect(paymentProviderWebhookService.ingestPaymentWebhook).toHaveBeenCalledWith(expect.objectContaining({
            provider: client_1.PaymentProvider.STRIPE,
            payload,
            rawBody: JSON.stringify(payload),
            signatureHeader: 'v1=signature',
            signingSecret: 'webhook-secret',
            headers: expect.objectContaining({
                'x-request-id': 'req_1,req_2',
            }),
        }));
        expect(queueService.add).toHaveBeenCalledWith('provider-webhooks', 'process-payment-provider-event', {
            paymentProviderEventId: 'payment_provider_event_1',
        });
        expect(result).toMatchObject({
            paymentProviderEventId: 'payment_provider_event_1',
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        });
    });
    it('ingests and queues refund provider webhooks', async () => {
        const { controller, refundProviderWebhookService, providerWebhookSecretsService, queueService, } = makeController();
        const payload = {
            id: 'evt_refund_1',
            type: 'refund.succeeded',
        };
        const result = await controller.receiveRefundWebhook(client_1.PaymentProvider.STRIPE, payload, {
            'x-webhook-signature': 'sha256=signature',
        }, {
            rawBody: JSON.stringify(payload),
        });
        expect(providerWebhookSecretsService.resolveSigningSecret).toHaveBeenCalledWith(client_1.PaymentProvider.STRIPE, 'refund');
        expect(refundProviderWebhookService.ingestRefundWebhook).toHaveBeenCalledWith(expect.objectContaining({
            provider: client_1.PaymentProvider.STRIPE,
            payload,
            rawBody: JSON.stringify(payload),
            signatureHeader: 'sha256=signature',
            signingSecret: 'webhook-secret',
        }));
        expect(queueService.add).toHaveBeenCalledWith('provider-webhooks', 'process-refund-provider-event', {
            refundProviderEventId: 'refund_provider_event_1',
        });
        expect(result).toMatchObject({
            refundProviderEventId: 'refund_provider_event_1',
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        });
    });
});
//# sourceMappingURL=provider-webhooks.controller.spec.js.map