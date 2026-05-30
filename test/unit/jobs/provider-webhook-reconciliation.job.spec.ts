import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../src/infrastructure/queue/queue.service';
import { ProviderWebhookReconciliationJob } from '../../../src/jobs/provider-webhook-reconciliation.job';
import { PaymentsRepository } from '../../../src/modules/payments/repositories/payments.repository';
import { RefundsRepository } from '../../../src/modules/refunds/repositories/refunds.repository';

describe('ProviderWebhookReconciliationJob', () => {
  it('registers the reconciliation handler and queues processable provider events', async () => {
    const queueService = {
      add: jest.fn().mockResolvedValue({ id: 'job_1' }),
      registerHandler: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const paymentsRepository = {
      listProcessablePaymentProviderEvents: jest.fn().mockResolvedValue([
        {
          id: 'payment_provider_event_1',
        },
      ]),
    } as unknown as jest.Mocked<PaymentsRepository>;
    const refundsRepository = {
      listProcessableRefundProviderEvents: jest.fn().mockResolvedValue([
        {
          id: 'refund_provider_event_1',
        },
      ]),
    } as unknown as jest.Mocked<RefundsRepository>;
    const logger = {
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const job = new ProviderWebhookReconciliationJob(
      queueService,
      paymentsRepository,
      refundsRepository,
      logger,
    );

    job.onModuleInit();
    await job.handle({
      limit: 10,
    });

    expect(queueService.registerHandler).toHaveBeenCalledWith(
      'provider-webhooks',
      'reconcile-provider-events',
      expect.any(Function),
    );
    expect(paymentsRepository.listProcessablePaymentProviderEvents).toHaveBeenCalledWith(
      10,
    );
    expect(refundsRepository.listProcessableRefundProviderEvents).toHaveBeenCalledWith(
      10,
    );
    expect(queueService.add).toHaveBeenNthCalledWith(
      1,
      'provider-webhooks',
      'process-payment-provider-event',
      {
        paymentProviderEventId: 'payment_provider_event_1',
        retryTerminal: true,
      },
    );
    expect(queueService.add).toHaveBeenNthCalledWith(
      2,
      'provider-webhooks',
      'process-refund-provider-event',
      {
        refundProviderEventId: 'refund_provider_event_1',
        retryTerminal: true,
      },
    );
    expect(logger.logEvent).toHaveBeenCalledWith(
      'Provider webhook reconciliation job queued events.',
      {
        limit: 10,
        paymentEventCount: 1,
        refundEventCount: 1,
      },
      'ProviderWebhookReconciliationJob',
    );
  });
});
