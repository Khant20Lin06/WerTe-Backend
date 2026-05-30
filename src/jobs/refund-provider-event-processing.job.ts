import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { RefundProviderEventProcessorService } from '../modules/refunds/services/refund-provider-event-processor.service';

export type RefundProviderEventProcessingJobPayload = {
  refundProviderEventId: string;
  retryTerminal?: boolean;
};

@Injectable()
export class RefundProviderEventProcessingJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly refundProviderEventProcessorService: RefundProviderEventProcessorService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.providerWebhooks,
      QueueJobNames.providerWebhooks.processRefundEvent,
      (payload) => this.handle(payload as RefundProviderEventProcessingJobPayload),
    );
  }

  async handle(payload: RefundProviderEventProcessingJobPayload): Promise<void> {
    const event =
      await this.refundProviderEventProcessorService.processRefundProviderEvent({
        refundProviderEventId: payload.refundProviderEventId,
        retryTerminal: payload.retryTerminal === true,
      });

    this.logger.logEvent(
      'Refund provider event processing job completed.',
      {
        processingStatus: event.processingStatus,
        providerEventId: event.providerEventId,
        refundProviderEventId: event.refundProviderEventId,
      },
      'RefundProviderEventProcessingJob',
    );
  }
}
