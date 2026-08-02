import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { AppLogger } from '../logging/app.logger';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(configService: ConfigService, logger: AppLogger) {
    super(configService.getOrThrow<string>('redis.url'), {
      keyPrefix: configService.get<string>('redis.keyPrefix'),
      // Cap reconnect backoff instead of ioredis's unbounded default growth.
      // The connection itself keeps retrying in the background regardless of
      // this setting — this only controls how long each *retry* waits.
      retryStrategy: (attempt) => Math.min(attempt * 200, 5_000),
      maxRetriesPerRequest: 2,
      connectTimeout: 5_000,
      // Reject commands immediately when disconnected instead of queuing
      // them to wait for a reconnect — every caller wraps ops in
      // safeRedisOp(), which depends on a command failing fast to degrade
      // to its fallback.
      enableOfflineQueue: false,
      // A stopped-but-not-removed Redis (the common case: container
      // crash/restart, not a clean "connection refused") black-holes new TCP
      // connections instead of rejecting them — connectTimeout bounds that.
      // But a command can also be sent on a socket ioredis still considers
      // "connecting" and then get no response at all; without a per-command
      // timeout that command has nothing bounding it and hangs indefinitely,
      // regardless of enableOfflineQueue. Verified live: with only
      // enableOfflineQueue:false, GET /health/ready still hung 15s+ against
      // a stopped Redis container; adding commandTimeout fixed it.
      commandTimeout: 3_000,
    });

    this.on('error', (error) => {
      logger.warnEvent(
        'Redis connection error.',
        { error: String(error) },
        'RedisService',
      );
    });

    this.on('reconnecting', (delayMs: number) => {
      logger.warnEvent(
        'Redis reconnecting.',
        { delayMs },
        'RedisService',
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }
}
