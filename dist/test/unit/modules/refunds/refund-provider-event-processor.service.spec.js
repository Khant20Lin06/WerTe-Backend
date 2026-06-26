"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const refund_provider_event_processor_service_1 = require("../../../../src/modules/refunds/services/refund-provider-event-processor.service");
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
function makeRefundRecord(overrides) {
    return {
        id: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 're_123',
        status: client_1.RefundStatus.PENDING,
        payment: {
            provider: client_1.PaymentProvider.STRIPE,
        },
        ...overrides,
    };
}
function makeRefundSummary(overrides) {
    return {
        refundId: 'refund_1',
        paymentId: 'payment_1',
        orderId: 'order_1',
        providerReference: 're_123',
        status: client_1.RefundStatus.SUCCEEDED,
        payment: {
            status: client_1.PaymentStatus.PARTIALLY_REFUNDED,
        },
        order: {
            status: 'DELIVERED',
        },
        ...overrides,
    };
}
function makeRepository() {
    return {
        findRefundProviderEventById: jest.fn(),
        findById: jest.fn(),
        findLatestByProviderReference: jest.fn(),
        updateRefundProviderEventProcessingState: jest.fn(async (payload) => makeRefundProviderEventRecord({
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
function makeRefundOperationsService() {
    return {
        succeedCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary()),
        failCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary({
            status: client_1.RefundStatus.FAILED,
        })),
        cancelCurrentAdminRefund: jest.fn().mockResolvedValue(makeRefundSummary({
            status: client_1.RefundStatus.CANCELLED,
        })),
    };
}
describe('RefundProviderEventProcessorService', () => {
    const occurredAt = new Date('2026-04-25T10:00:00.000Z');
    it('succeeds refund provider events and marks them processed', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord());
        refundsRepository.findById.mockResolvedValue(makeRefundRecord());
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        const result = await service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
        });
        expect(refundOperationsService.succeedCurrentAdminRefund).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'system:refund-provider-webhook',
        }), expect.objectContaining({
            refundId: 'refund_1',
            providerReference: 're_123',
            reasonCode: 'provider_refund_succeeded',
            metadata: expect.objectContaining({
                providerWebhook: true,
                refundProviderEventId: 'refund_provider_event_1',
            }),
        }), {
            skipAdminFinanceAccess: true,
        });
        expect(refundsRepository.updateRefundProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            refundProviderEventId: 'refund_provider_event_1',
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            refundId: 'refund_1',
            paymentId: 'payment_1',
            orderId: 'order_1',
            occurredAt,
        }));
        expect(result.processingStatus).toBe(client_1.ProviderEventProcessingStatus.PROCESSED);
    });
    it('matches missing refund ids by provider reference and fails refunds from failed events', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord({
            eventType: 'refund.failed',
            refundId: null,
            normalizedStatus: client_1.RefundStatus.FAILED,
        }));
        refundsRepository.findLatestByProviderReference.mockResolvedValue(makeRefundRecord());
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        await service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
        });
        expect(refundsRepository.findById).not.toHaveBeenCalled();
        expect(refundsRepository.findLatestByProviderReference).toHaveBeenCalledWith(client_1.PaymentProvider.STRIPE, 're_123');
        expect(refundOperationsService.failCurrentAdminRefund).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            refundId: 'refund_1',
            failureCode: 'provider_refund_failed',
            failureMessage: 'Provider reported refund failure.',
        }), {
            skipAdminFinanceAccess: true,
        });
    });
    it('cancels refunds when provider events report cancellation', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord({
            eventType: 'refund.cancelled',
            normalizedStatus: client_1.RefundStatus.CANCELLED,
        }));
        refundsRepository.findById.mockResolvedValue(makeRefundRecord());
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        await service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
        });
        expect(refundOperationsService.cancelCurrentAdminRefund).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            reasonCode: 'provider_refund_cancelled',
            note: 'Provider reported refund cancellation.',
        }), {
            skipAdminFinanceAccess: true,
        });
    });
    it('ignores non-terminal refund statuses without touching lifecycle services', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord({
            normalizedStatus: client_1.RefundStatus.PROCESSING,
        }));
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        const result = await service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
        });
        expect(refundOperationsService.succeedCurrentAdminRefund).not.toHaveBeenCalled();
        expect(refundsRepository.updateRefundProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.IGNORED,
            failureCode: 'non_terminal_refund_status',
        }));
        expect(result.processingStatus).toBe(client_1.ProviderEventProcessingStatus.IGNORED);
    });
    it('returns already terminal provider events without replaying lifecycle work', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord({
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            processedAt: occurredAt,
        }));
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        const result = await service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
        });
        expect(refundOperationsService.succeedCurrentAdminRefund).not.toHaveBeenCalled();
        expect(refundsRepository.updateRefundProviderEventProcessingState).not.toHaveBeenCalled();
        expect(result.processingStatus).toBe(client_1.ProviderEventProcessingStatus.PROCESSED);
    });
    it('retries failed provider events when reconciliation asks for terminal retry', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord({
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            failedAt: occurredAt,
        }));
        refundsRepository.findById.mockResolvedValue(makeRefundRecord());
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        await service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
            retryTerminal: true,
        });
        expect(refundOperationsService.succeedCurrentAdminRefund).toHaveBeenCalled();
        expect(refundsRepository.updateRefundProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
        }));
    });
    it('marks lifecycle failures as failed and rethrows the original error', async () => {
        const refundsRepository = makeRepository();
        const refundOperationsService = makeRefundOperationsService();
        const error = new app_exception_1.AppException('This refund can no longer be marked as succeeded.', common_1.HttpStatus.CONFLICT);
        refundsRepository.findRefundProviderEventById.mockResolvedValue(makeRefundProviderEventRecord());
        refundsRepository.findById.mockResolvedValue(makeRefundRecord());
        refundOperationsService.succeedCurrentAdminRefund.mockRejectedValue(error);
        const service = new refund_provider_event_processor_service_1.RefundProviderEventProcessorService(refundsRepository, refundOperationsService);
        await expect(service.processRefundProviderEvent({
            refundProviderEventId: 'refund_provider_event_1',
            occurredAt,
        })).rejects.toBe(error);
        expect(refundsRepository.updateRefundProviderEventProcessingState).toHaveBeenCalledWith(expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            failureCode: 'CONFLICT',
            failureMessage: 'This refund can no longer be marked as succeeded.',
        }));
    });
});
//# sourceMappingURL=refund-provider-event-processor.service.spec.js.map