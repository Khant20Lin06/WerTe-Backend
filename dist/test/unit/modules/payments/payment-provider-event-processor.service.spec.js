"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const payment_provider_event_processor_service_1 = require("../../../../src/modules/payments/services/payment-provider-event-processor.service");
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
function makePaymentRecord(overrides) {
    return {
        id: 'payment_1',
        orderId: 'order_1',
        provider: client_1.PaymentProvider.STRIPE,
        providerReference: 'pi_123',
        status: client_1.PaymentStatus.REQUIRES_ACTION,
        ...overrides,
    };
}
function makePaymentSummary(overrides) {
    return {
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 'pi_123',
        status: client_1.PaymentStatus.SUCCEEDED,
        order: {
            status: 'PLACED',
        },
        ...overrides,
    };
}
function makeRepository() {
    return {
        findPaymentProviderEventById: jest.fn(),
        findById: jest.fn(),
        findLatestByProviderReference: jest.fn(),
        updatePaymentProviderEventProcessingState: jest.fn(async (payload) => makePaymentProviderEventRecord({
            processingStatus: payload.processingStatus,
            failureCode: payload.failureCode ?? null,
            failureMessage: payload.failureMessage ?? null,
            processedAt: payload.processingStatus === client_1.ProviderEventProcessingStatus.PROCESSED
                ? payload.occurredAt
                : null,
            failedAt: payload.processingStatus === client_1.ProviderEventProcessingStatus.FAILED
                ? payload.occurredAt
                : null,
            ignoredAt: payload.processingStatus === client_1.ProviderEventProcessingStatus.IGNORED
                ? payload.occurredAt
                : null,
        })),
    };
}
function makeLifecycleService() {
    return {
        confirmCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary()),
        failCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary({
            status: client_1.PaymentStatus.FAILED,
        })),
        cancelCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary({
            status: client_1.PaymentStatus.CANCELLED,
        })),
        expireCurrentPayment: jest.fn().mockResolvedValue(makePaymentSummary({
            status: client_1.PaymentStatus.EXPIRED,
        })),
    };
}
describe('PaymentProviderEventProcessorService', () => {
    const occurredAt = new Date('2026-04-25T09:00:00.000Z');
    it('confirms succeeded provider events and marks them processed', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord());
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord());
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        const result = await service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
        });
        expect(paymentLifecycleService.confirmCurrentPayment).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'system:payment-provider-webhook',
        }), expect.objectContaining({
            paymentId: 'payment_1',
            providerReference: 'pi_123',
            reasonCode: 'provider_payment_succeeded',
            metadata: expect.objectContaining({
                providerWebhook: true,
                paymentProviderEventId: 'payment_provider_event_1',
            }),
        }), {
            skipAdminFinanceAccess: true,
        });
        expect(paymentsRepository.updatePaymentProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            paymentProviderEventId: 'payment_provider_event_1',
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            paymentId: 'payment_1',
            orderId: 'order_1',
            occurredAt,
        }));
        expect(result.processingStatus).toBe(client_1.ProviderEventProcessingStatus.PROCESSED);
    });
    it('matches missing payment ids by provider reference and fails payments from failed events', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord({
            eventType: 'payment_intent.payment_failed',
            paymentId: null,
            normalizedStatus: client_1.PaymentStatus.FAILED,
        }));
        paymentsRepository.findLatestByProviderReference.mockResolvedValue(makePaymentRecord());
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        await service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
        });
        expect(paymentsRepository.findById).not.toHaveBeenCalled();
        expect(paymentsRepository.findLatestByProviderReference).toHaveBeenCalledWith(client_1.PaymentProvider.STRIPE, 'pi_123');
        expect(paymentLifecycleService.failCurrentPayment).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            paymentId: 'payment_1',
            failureCode: 'provider_payment_failed',
            failureMessage: 'Provider reported payment failure.',
        }), {
            skipAdminFinanceAccess: true,
        });
    });
    it('expires payments when provider events report expiration', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord({
            eventType: 'payment_intent.expired',
            normalizedStatus: client_1.PaymentStatus.EXPIRED,
        }));
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord());
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        await service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
        });
        expect(paymentLifecycleService.expireCurrentPayment).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            reasonCode: 'provider_payment_expired',
            note: 'Provider reported payment expiration.',
        }), {
            skipAdminFinanceAccess: true,
        });
    });
    it('ignores non-terminal payment statuses without touching lifecycle services', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord({
            normalizedStatus: client_1.PaymentStatus.PROCESSING,
        }));
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        const result = await service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
        });
        expect(paymentLifecycleService.confirmCurrentPayment).not.toHaveBeenCalled();
        expect(paymentsRepository.updatePaymentProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.IGNORED,
            failureCode: 'non_terminal_payment_status',
        }));
        expect(result.processingStatus).toBe(client_1.ProviderEventProcessingStatus.IGNORED);
    });
    it('returns already terminal provider events without replaying lifecycle work', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord({
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            processedAt: occurredAt,
        }));
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        const result = await service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
        });
        expect(paymentLifecycleService.confirmCurrentPayment).not.toHaveBeenCalled();
        expect(paymentsRepository.updatePaymentProviderEventProcessingState).not.toHaveBeenCalled();
        expect(result.processingStatus).toBe(client_1.ProviderEventProcessingStatus.PROCESSED);
    });
    it('retries failed provider events when reconciliation asks for terminal retry', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord({
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            failedAt: occurredAt,
        }));
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord());
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        await service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
            retryTerminal: true,
        });
        expect(paymentLifecycleService.confirmCurrentPayment).toHaveBeenCalled();
        expect(paymentsRepository.updatePaymentProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
        }));
    });
    it('marks lifecycle failures as failed and rethrows the original error', async () => {
        const paymentsRepository = makeRepository();
        const paymentLifecycleService = makeLifecycleService();
        const error = new app_exception_1.AppException('This payment can no longer be confirmed.', common_1.HttpStatus.CONFLICT);
        paymentsRepository.findPaymentProviderEventById.mockResolvedValue(makePaymentProviderEventRecord());
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord());
        paymentLifecycleService.confirmCurrentPayment.mockRejectedValue(error);
        const service = new payment_provider_event_processor_service_1.PaymentProviderEventProcessorService(paymentsRepository, paymentLifecycleService);
        await expect(service.processPaymentProviderEvent({
            paymentProviderEventId: 'payment_provider_event_1',
            occurredAt,
        })).rejects.toBe(error);
        expect(paymentsRepository.updatePaymentProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            failureCode: 'CONFLICT',
            failureMessage: 'This payment can no longer be confirmed.',
        }));
    });
});
//# sourceMappingURL=payment-provider-event-processor.service.spec.js.map