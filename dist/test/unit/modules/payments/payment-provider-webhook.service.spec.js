"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const payment_provider_webhook_service_1 = require("../../../../src/modules/payments/services/payment-provider-webhook.service");
const provider_webhook_normalizer_service_1 = require("../../../../src/modules/payments/services/provider-webhook-normalizer.service");
function makePaymentProviderEventRecord(overrides) {
    return {
        id: 'payment_provider_event_1',
        provider: client_1.PaymentProvider.STRIPE,
        providerEventId: 'evt_1',
        eventType: 'payment_intent.succeeded',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 'pi_123',
        normalizedStatus: client_1.PaymentStatus.SUCCEEDED,
        verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
        processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        signatureHeader: 'v1=signature',
        headersJson: { 'stripe-signature': 'v1=signature' },
        rawPayloadJson: { id: 'evt_1' },
        normalizedPayloadJson: { paymentId: 'payment_1' },
        processingMetadataJson: null,
        failureCode: null,
        failureMessage: null,
        receivedAt: new Date('2026-04-25T08:00:00.000Z'),
        processedAt: null,
        failedAt: null,
        ignoredAt: null,
        createdAt: new Date('2026-04-25T08:00:00.000Z'),
        updatedAt: new Date('2026-04-25T08:00:00.000Z'),
        ...overrides,
    };
}
describe('PaymentProviderWebhookService', () => {
    const normalizer = new provider_webhook_normalizer_service_1.ProviderWebhookNormalizerService();
    it('persists verified payment provider webhooks with normalized fields', async () => {
        const paymentsRepository = {
            findPaymentProviderEventByProviderEventId: jest.fn().mockResolvedValue(null),
            createPaymentProviderEvent: jest
                .fn()
                .mockResolvedValue(makePaymentProviderEventRecord()),
        };
        const signatureService = {
            verifySignature: jest.fn().mockReturnValue({
                status: client_1.ProviderEventVerificationStatus.VERIFIED,
                failureCode: null,
                failureMessage: null,
            }),
        };
        const service = new payment_provider_webhook_service_1.PaymentProviderWebhookService(paymentsRepository, normalizer, signatureService);
        const result = await service.ingestPaymentWebhook({
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
            rawBody: '{"id":"evt_1"}',
            signatureHeader: 'v1=signature',
            signingSecret: 'secret_1',
            headers: { 'stripe-signature': 'v1=signature' },
            receivedAt: new Date('2026-04-25T08:00:00.000Z'),
        });
        expect(paymentsRepository.createPaymentProviderEvent).toHaveBeenCalledWith(expect.objectContaining({
            provider: client_1.PaymentProvider.STRIPE,
            providerEventId: 'evt_1',
            eventType: 'payment_intent.succeeded',
            paymentId: 'payment_1',
            orderId: 'order_1',
            providerReference: 'pi_123',
            normalizedStatus: client_1.PaymentStatus.SUCCEEDED,
            verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
            processingStatus: client_1.ProviderEventProcessingStatus.RECEIVED,
        }));
        expect(result).toMatchObject({
            paymentProviderEventId: 'payment_provider_event_1',
            providerEventId: 'evt_1',
            normalizedStatus: client_1.PaymentStatus.SUCCEEDED,
        });
    });
    it('returns existing payment provider events for replayed provider event ids', async () => {
        const paymentsRepository = {
            findPaymentProviderEventByProviderEventId: jest
                .fn()
                .mockResolvedValue(makePaymentProviderEventRecord()),
            createPaymentProviderEvent: jest.fn(),
        };
        const service = new payment_provider_webhook_service_1.PaymentProviderWebhookService(paymentsRepository, normalizer, {
            verifySignature: jest.fn().mockReturnValue({
                status: client_1.ProviderEventVerificationStatus.SKIPPED,
                failureCode: null,
                failureMessage: null,
            }),
        });
        const result = await service.ingestPaymentWebhook({
            provider: client_1.PaymentProvider.STRIPE,
            payload: {
                id: 'evt_1',
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_123',
                        metadata: { paymentId: 'payment_1' },
                    },
                },
            },
        });
        expect(paymentsRepository.createPaymentProviderEvent).not.toHaveBeenCalled();
        expect(result.paymentProviderEventId).toBe('payment_provider_event_1');
    });
    it('persists failed verification details and rejects invalid signatures', async () => {
        const paymentsRepository = {
            findPaymentProviderEventByProviderEventId: jest.fn().mockResolvedValue(null),
            createPaymentProviderEvent: jest.fn().mockResolvedValue(makePaymentProviderEventRecord({
                verificationStatus: client_1.ProviderEventVerificationStatus.FAILED,
                processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
                failureCode: 'invalid_signature',
                failedAt: new Date('2026-04-25T08:00:00.000Z'),
            })),
        };
        const service = new payment_provider_webhook_service_1.PaymentProviderWebhookService(paymentsRepository, normalizer, {
            verifySignature: jest.fn().mockReturnValue({
                status: client_1.ProviderEventVerificationStatus.FAILED,
                failureCode: 'invalid_signature',
                failureMessage: 'Invalid signature',
            }),
        });
        await expect(service.ingestPaymentWebhook({
            provider: client_1.PaymentProvider.STRIPE,
            payload: { id: 'evt_1', type: 'payment.failed' },
            receivedAt: new Date('2026-04-25T08:00:00.000Z'),
        })).rejects.toBeInstanceOf(app_exception_1.AppException);
        expect(paymentsRepository.createPaymentProviderEvent).toHaveBeenCalledWith(expect.objectContaining({
            verificationStatus: client_1.ProviderEventVerificationStatus.FAILED,
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            failureCode: 'invalid_signature',
            failedAt: new Date('2026-04-25T08:00:00.000Z'),
        }));
    });
});
//# sourceMappingURL=payment-provider-webhook.service.spec.js.map