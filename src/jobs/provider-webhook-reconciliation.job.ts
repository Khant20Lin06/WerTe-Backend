import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { PaymentsRepository } from '../modules/payments/repositories/payments.repository';
import { RefundsRepository } from '../modules/refunds/repositories/refunds.repository';

export type ProviderWebhookReconciliationJobPayload = {
  limit?: number;
};

@Injectable()
export class ProviderWebhookReconciliationJob implements OnModuleInit {
  private static readonly defaultLimit = 50;

  constructor(
    private readonly queueService: QueueService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly refundsRepository: RefundsRepository,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.providerWebhooks,
      QueueJobNames.providerWebhooks.reconcileEvents,
      (payload) => this.handle(payload as ProviderWebhookReconciliationJobPayload),
    );
  }

  async handle(payload: ProviderWebhookReconciliationJobPayload): Promise<void> {
    const limit = this.resolveLimit(payload.limit);
    const [paymentEvents, refundEvents] = await Promise.all([
      this.paymentsRepository.listProcessablePaymentProviderEvents(limit),
      this.refundsRepository.listProcessableRefundProviderEvents(limit),
    ]);

    for (const event of paymentEvents) {
      await this.queueService.add(
        QueueNames.providerWebhooks,
        QueueJobNames.providerWebhooks.processPaymentEvent,
        {
          paymentProviderEventId: event.id,
          retryTerminal: true,
        },
      );
    }

    for (const event of refundEvents) {
      await this.queueService.add(
        QueueNames.providerWebhooks,
        QueueJobNames.providerWebhooks.processRefundEvent,
        {
          refundProviderEventId: event.id,
          retryTerminal: true,
        },
      );
    }

    this.logger.logEvent(
      'Provider webhook reconciliation job queued events.',
      {
        limit,
        paymentEventCount: paymentEvents.length,
        refundEventCount: refundEvents.length,
      },
      'ProviderWebhookReconciliationJob',
    );
  }

  private resolveLimit(limit: number | undefined): number {
    if (limit === undefined || !Number.isFinite(limit)) {
      return ProviderWebhookReconciliationJob.defaultLimit;
    }

    return Math.max(1, Math.min(Math.floor(limit), 250));
  }
}
