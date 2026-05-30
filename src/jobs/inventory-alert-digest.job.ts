import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { NotificationAlertDigestService } from '../modules/notifications/services/notification-alert-digest.service';

export type InventoryAlertDigestJobPayload = {
  triggeredAtIso?: string | null;
};

@Injectable()
export class InventoryAlertDigestJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly notificationAlertDigestService: NotificationAlertDigestService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.notifications,
      QueueJobNames.notifications.inventoryAlertDigest,
      (payload) => this.handle(payload as InventoryAlertDigestJobPayload),
    );
  }

  async handle(payload: InventoryAlertDigestJobPayload): Promise<void> {
    const at = this.resolveTriggeredAt(payload.triggeredAtIso);
    const result = await this.notificationAlertDigestService.runDigestCycle(at);

    this.logger.logEvent(
      'Inventory alert digest job completed.',
      {
        triggeredAtIso: at.toISOString(),
        ...result,
      },
      'InventoryAlertDigestJob',
    );
  }

  private resolveTriggeredAt(triggeredAtIso: string | null | undefined): Date {
    if (triggeredAtIso === undefined || triggeredAtIso === null) {
      return new Date();
    }

    const parsed = new Date(triggeredAtIso);

    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}
