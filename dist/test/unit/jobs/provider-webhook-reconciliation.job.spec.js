"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const provider_webhook_reconciliation_job_1 = require("../../../src/jobs/provider-webhook-reconciliation.job");
describe('ProviderWebhookReconciliationJob', () => {
    it('registers the reconciliation handler and queues processable provider events', async () => {
        const queueService = {
            add: jest.fn().mockResolvedValue({ id: 'job_1' }),
            registerHandler: jest.fn(),
        };
        const paymentsRepository = {
            listProcessablePaymentProviderEvents: jest.fn().mockResolvedValue([
                {
                    id: 'payment_provider_event_1',
                },
            ]),
        };
        const refundsRepository = {
            listProcessableRefundProviderEvents: jest.fn().mockResolvedValue([
                {
                    id: 'refund_provider_event_1',
                },
            ]),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new provider_webhook_reconciliation_job_1.ProviderWebhookReconciliationJob(queueService, paymentsRepository, refundsRepository, logger);
        job.onModuleInit();
        await job.handle({
            limit: 10,
        });
        expect(queueService.registerHandler).toHaveBeenCalledWith('provider-webhooks', 'reconcile-provider-events', expect.any(Function));
        expect(paymentsRepository.listProcessablePaymentProviderEvents).toHaveBeenCalledWith(10);
        expect(refundsRepository.listProcessableRefundProviderEvents).toHaveBeenCalledWith(10);
        expect(queueService.add).toHaveBeenNthCalledWith(1, 'provider-webhooks', 'process-payment-provider-event', {
            paymentProviderEventId: 'payment_provider_event_1',
            retryTerminal: true,
        });
        expect(queueService.add).toHaveBeenNthCalledWith(2, 'provider-webhooks', 'process-refund-provider-event', {
            refundProviderEventId: 'refund_provider_event_1',
            retryTerminal: true,
        });
        expect(logger.logEvent).toHaveBeenCalledWith('Provider webhook reconciliation job queued events.', {
            limit: 10,
            paymentEventCount: 1,
            refundEventCount: 1,
        }, 'ProviderWebhookReconciliationJob');
    });
});
//# sourceMappingURL=provider-webhook-reconciliation.job.spec.js.map