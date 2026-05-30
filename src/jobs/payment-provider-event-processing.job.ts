import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { PaymentProviderEventProcessorService } from '../modules/payments/services/payment-provider-event-processor.service';

export type PaymentProviderEventProcessingJobPayload = {
  paymentProviderEventId: string;
  retryTerminal?: boolean;
};

@Injectable()
export class PaymentProviderEventProcessingJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly paymentProviderEventProcessorService: PaymentProviderEventProcessorService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.providerWebhooks,
      QueueJobNames.providerWebhooks.processPaymentEvent,
      (payload) => this.handle(payload as PaymentProviderEventProcessingJobPayload),
    );
  }

  async handle(payload: PaymentProviderEventProcessingJobPayload): Promise<void> {
    const event =
      await this.paymentProviderEventProcessorService.processPaymentProviderEvent({
        paymentProviderEventId: payload.paymentProviderEventId,
        retryTerminal: payload.retryTerminal === true,
      });

    this.logger.logEvent(
      'Payment provider event processing job completed.',
      {
        paymentProviderEventId: event.paymentProviderEventId,
        processingStatus: event.processingStatus,
        providerEventId: event.providerEventId,
      },
      'PaymentProviderEventProcessingJob',
    );
  }
}
