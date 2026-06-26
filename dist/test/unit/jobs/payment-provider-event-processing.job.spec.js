"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const payment_provider_event_processing_job_1 = require("../../../src/jobs/payment-provider-event-processing.job");
describe('PaymentProviderEventProcessingJob', () => {
    it('registers the payment webhook processing handler and processes payloads', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const paymentProviderEventProcessorService = {
            processPaymentProviderEvent: jest.fn().mockResolvedValue({
                paymentProviderEventId: 'payment_provider_event_1',
                provider: client_1.PaymentProvider.STRIPE,
                providerEventId: 'evt_1',
                processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
                normalizedStatus: client_1.PaymentStatus.SUCCEEDED,
                verificationStatus: client_1.ProviderEventVerificationStatus.VERIFIED,
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new payment_provider_event_processing_job_1.PaymentProviderEventProcessingJob(queueService, paymentProviderEventProcessorService, logger);
        job.onModuleInit();
        await job.handle({
            paymentProviderEventId: 'payment_provider_event_1',
            retryTerminal: true,
        });
        expect(queueService.registerHandler).toHaveBeenCalledWith('provider-webhooks', 'process-payment-provider-event', expect.any(Function));
        expect(paymentProviderEventProcessorService.processPaymentProviderEvent).toHaveBeenCalledWith({
            paymentProviderEventId: 'payment_provider_event_1',
            retryTerminal: true,
        });
        expect(logger.logEvent).toHaveBeenCalledWith('Payment provider event processing job completed.', expect.objectContaining({
            paymentProviderEventId: 'payment_provider_event_1',
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
        }), 'PaymentProviderEventProcessingJob');
    });
});
//# sourceMappingURL=payment-provider-event-processing.job.spec.js.map