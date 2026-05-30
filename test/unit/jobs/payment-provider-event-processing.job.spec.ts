import {
  PaymentProvider,
  PaymentStatus,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
} from '@prisma/client';

import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../src/infrastructure/queue/queue.service';
import { PaymentProviderEventProcessingJob } from '../../../src/jobs/payment-provider-event-processing.job';
import { PaymentProviderEventProcessorService } from '../../../src/modules/payments/services/payment-provider-event-processor.service';

describe('PaymentProviderEventProcessingJob', () => {
  it('registers the payment webhook processing handler and processes payloads', async () => {
    const queueService = {
      registerHandler: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const paymentProviderEventProcessorService = {
      processPaymentProviderEvent: jest.fn().mockResolvedValue({
        paymentProviderEventId: 'payment_provider_event_1',
        provider: PaymentProvider.STRIPE,
        providerEventId: 'evt_1',
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        normalizedStatus: PaymentStatus.SUCCEEDED,
        verificationStatus: ProviderEventVerificationStatus.VERIFIED,
      }),
    } as unknown as jest.Mocked<PaymentProviderEventProcessorService>;
    const logger = {
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const job = new PaymentProviderEventProcessingJob(
      queueService,
      paymentProviderEventProcessorService,
      logger,
    );

    job.onModuleInit();
    await job.handle({
      paymentProviderEventId: 'payment_provider_event_1',
      retryTerminal: true,
    });

    expect(queueService.registerHandler).toHaveBeenCalledWith(
      'provider-webhooks',
      'process-payment-provider-event',
      expect.any(Function),
    );
    expect(
      paymentProviderEventProcessorService.processPaymentProviderEvent,
    ).toHaveBeenCalledWith({
      paymentProviderEventId: 'payment_provider_event_1',
      retryTerminal: true,
    });
    expect(logger.logEvent).toHaveBeenCalledWith(
      'Payment provider event processing job completed.',
      expect.objectContaining({
        paymentProviderEventId: 'payment_provider_event_1',
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
      }),
      'PaymentProviderEventProcessingJob',
    );
  });
});
