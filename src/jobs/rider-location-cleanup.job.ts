import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';

type RiderLocationCleanupJobPayload = {
  riderId?: string | null;
  beforeIso?: string | null;
};

@Injectable()
export class RiderLocationCleanupJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.riderLocationCleanup,
      QueueJobNames.riderLocationCleanup.cleanupStaleLocations,
      (payload) => this.handle(payload as RiderLocationCleanupJobPayload),
    );
  }

  async handle(payload: RiderLocationCleanupJobPayload) {
    this.logger.logEvent(
      'Rider location cleanup baseline job processed.',
      {
        beforeIso: payload.beforeIso ?? null,
        riderId: payload.riderId ?? null,
      },
      'RiderLocationCleanupJob',
    );
  }
}
