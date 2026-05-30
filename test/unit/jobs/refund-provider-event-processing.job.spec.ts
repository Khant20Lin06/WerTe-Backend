import {
  PaymentProvider,
  ProviderEventProcessingStatus,
  ProviderEventVerificationStatus,
  RefundStatus,
} from '@prisma/client';

import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../src/infrastructure/queue/queue.service';
import { RefundProviderEventProcessingJob } from '../../../src/jobs/refund-provider-event-processing.job';
import { RefundProviderEventProcessorService } from '../../../src/modules/refunds/services/refund-provider-event-processor.service';

describe('RefundProviderEventProcessingJob', () => {
  it('registers the refund webhook processing handler and processes payloads', async () => {
    const queueService = {
      registerHandler: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const refundProviderEventProcessorService = {
      processRefundProviderEvent: jest.fn().mockResolvedValue({
        refundProviderEventId: 'refund_provider_event_1',
        provider: PaymentProvider.STRIPE,
        providerEventId: 'evt_refund_1',
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        normalizedStatus: RefundStatus.SUCCEEDED,
        verificationStatus: ProviderEventVerificationStatus.VERIFIED,
      }),
    } as unknown as jest.Mocked<RefundProviderEventProcessorService>;
    const logger = {
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const job = new RefundProviderEventProcessingJob(
      queueService,
      refundProviderEventProcessorService,
      logger,
    );

    job.onModuleInit();
    await job.handle({
      refundProviderEventId: 'refund_provider_event_1',
      retryTerminal: true,
    });

    expect(queueService.registerHandler).toHaveBeenCalledWith(
      'provider-webhooks',
      'process-refund-provider-event',
      expect.any(Function),
    );
    expect(
      refundProviderEventProcessorService.processRefundProviderEvent,
    ).toHaveBeenCalledWith({
      refundProviderEventId: 'refund_provider_event_1',
      retryTerminal: true,
    });
    expect(logger.logEvent).toHaveBeenCalledWith(
      'Refund provider event processing job completed.',
      expect.objectContaining({
        processingStatus: ProviderEventProcessingStatus.PROCESSED,
        refundProviderEventId: 'refund_provider_event_1',
      }),
      'RefundProviderEventProcessingJob',
    );
  });
});
