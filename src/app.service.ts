import { Injectable } from '@nestjs/common';

import { PrismaService } from './infrastructure/database/prisma.service';
import { RedisService } from './infrastructure/redis/redis.service';
import { QueueService } from './infrastructure/queue/queue.service';

type HealthStatus = 'up' | 'down';

type ComponentHealth = {
  status: HealthStatus;
  latencyMs?: number;
  error?: string;
};

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly queueService: QueueService,
  ) {}

  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    const [database, cache, queue] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkQueue(),
    ]);

    const allUp =
      database.status === 'up' && cache.status === 'up' && queue.status === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database, cache, queue },
    };
  }

  async health() {
    return this.ready();
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    try {
      return await this.prisma.checkHealth();
    } catch (error) {
      return { status: 'down', error: String(error) };
    }
  }

  private async checkRedis(): Promise<ComponentHealth> {
    const startedAt = Date.now();
    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        return { status: 'down', error: `Unexpected PING response: ${pong}` };
      }
      return { status: 'up', latencyMs: Date.now() - startedAt };
    } catch (error) {
      return { status: 'down', error: String(error) };
    }
  }

  private checkQueue(): ComponentHealth {
    const handlers = this.queueService.listRegisteredHandlers();
    if (handlers.length === 0) {
      return { status: 'down', error: 'No BullMQ handlers registered' };
    }
    return { status: 'up' };
  }
}
