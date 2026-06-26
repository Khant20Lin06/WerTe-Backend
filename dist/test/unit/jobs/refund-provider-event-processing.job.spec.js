"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const refund_provider_event_processing_job_1 = require("../../../src/jobs/refund-provider-event-processing.job");
describe('RefundProviderEventProcessingJob', () => {
    it('registers the refund webhook processing handler and processes payloads', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const refundProviderEventProcessorService = {
            processRefundProviderEvent: jest.fn().mockResolvedValue({
                refundProviderEventId: 'refund_provider_event_1',
                provider: client_1.PaymentProvider.STRIPE,
                providerEventId: 'evt_refund_1',
                processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
                normalizedStatus: client_1.RefundStatus.SUCCEEDED,
                verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new refund_provider_event_processing_job_1.RefundProviderEventProcessingJob(queueService, refundProviderEventProcessorService, logger);
        job.onModuleInit();
        await job.handle({
            refundProviderEventId: 'refund_provider_event_1',
            retryTerminal: true,
        });
        expect(queueService.registerHandler).toHaveBeenCalledWith('provider-webhooks', 'process-refund-provider-event', expect.any(Function));
        expect(refundProviderEventProcessorService.processRefundProviderEvent).toHaveBeenCalledWith({
            refundProviderEventId: 'refund_provider_event_1',
            retryTerminal: true,
        });
        expect(logger.logEvent).toHaveBeenCalledWith('Refund provider event processing job completed.', expect.objectContaining({
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            refundProviderEventId: 'refund_provider_event_1',
        }), 'RefundProviderEventProcessingJob');
    });
});
//# sourceMappingURL=refund-provider-event-processing.job.spec.js.map