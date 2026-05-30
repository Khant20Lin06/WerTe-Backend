import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import {
  QueueJobNames,
  QueueNames,
} from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';

@Injectable()
export class NotificationAlertDigestScheduleService
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly intervalMs = 15 * 60 * 1000;

  private interval: NodeJS.Timeout | null = null;

  constructor(
    private readonly queueService: QueueService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.enqueueDigestRun();

    this.interval = setInterval(() => {
      void this.enqueueDigestRun();
    }, NotificationAlertDigestScheduleService.intervalMs);
    this.interval.unref?.();
    this.logger.debugEvent(
      'Scheduled recurring inventory alert digest job.',
      {
        intervalMs: NotificationAlertDigestScheduleService.intervalMs,
      },
      'NotificationAlertDigestScheduleService',
    );
  }

  onModuleDestroy(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async enqueueDigestRun(): Promise<void> {
    const triggeredAtIso = new Date().toISOString();

    await this.queueService.add(
      QueueNames.notifications,
      QueueJobNames.notifications.inventoryAlertDigest,
      {
        triggeredAtIso,
      },
    );
    this.logger.debugEvent(
      'Queued inventory alert digest job.',
      {
        triggeredAtIso,
      },
      'NotificationAlertDigestScheduleService',
    );
  }
}
