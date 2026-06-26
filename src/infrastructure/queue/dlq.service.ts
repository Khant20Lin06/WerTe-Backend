import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

import { AppLogger } from '../logging/app.logger';

export type DlqEntry = {
  id: string;
  queueName: string;
  jobName: string;
  payload: unknown;
  failedAt: string;
  lastError: string;
  attempts: number;
  createdAt: string;
};

const DLQ_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const DLQ_KEY_PREFIX = 'dlq';

@Injectable()
export class DlqService implements OnModuleInit {
  private readonly connection: IORedis;

  constructor(
    configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.connection = new IORedis(configService.getOrThrow<string>('redis.url'), {
      keyPrefix: '',
      maxRetriesPerRequest: null,
    });
  }

  onModuleInit(): void {
    // Connection is established lazily by ioredis on first command.
  }

  async push(entry: DlqEntry): Promise<void> {
    const key = this.toKey(entry.queueName, entry.jobName);
    const score = new Date(entry.failedAt).getTime();
    const value = JSON.stringify(entry);

    await this.connection.zadd(key, score, value);
    await this.connection.expire(key, DLQ_TTL_SECONDS);

    this.logger.errorEvent(
      'Job moved to dead-letter queue.',
      {
        id: entry.id,
        queueName: entry.queueName,
        jobName: entry.jobName,
        attempts: entry.attempts,
        lastError: entry.lastError,
      },
      'DlqService',
    );
  }

  async list(queueName?: string, jobName?: string): Promise<DlqEntry[]> {
    if (queueName !== undefined && jobName !== undefined) {
      return this.listFromKey(this.toKey(queueName, jobName));
    }

    // Scan all DLQ keys when no filter is provided.
    const keys = await this.scanKeys(`${DLQ_KEY_PREFIX}:*`);
    if (keys.length === 0) return [];

    const entries = await Promise.all(keys.map((key) => this.listFromKey(key)));
    return entries.flat().sort(
      (a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime(),
    );
  }

  async remove(queueName: string, jobName: string, jobId: string): Promise<boolean> {
    const key = this.toKey(queueName, jobName);
    const members = await this.connection.zrange(key, 0, -1);

    for (const member of members) {
      const entry = this.parseEntry(member);
      if (entry?.id === jobId) {
        await this.connection.zrem(key, member);
        return true;
      }
    }

    return false;
  }

  async pruneExpired(): Promise<number> {
    const keys = await this.scanKeys(`${DLQ_KEY_PREFIX}:*`);
    if (keys.length === 0) return 0;

    const cutoff = Date.now() - DLQ_TTL_SECONDS * 1000;
    let total = 0;

    for (const key of keys) {
      const removed = await this.connection.zremrangebyscore(key, '-inf', cutoff);
      total += removed;
    }

    return total;
  }

  async count(queueName?: string, jobName?: string): Promise<number> {
    if (queueName !== undefined && jobName !== undefined) {
      return this.connection.zcard(this.toKey(queueName, jobName));
    }

    const keys = await this.scanKeys(`${DLQ_KEY_PREFIX}:*`);
    if (keys.length === 0) return 0;

    const counts = await Promise.all(keys.map((k) => this.connection.zcard(k)));
    return counts.reduce((sum, c) => sum + c, 0);
  }

  private async listFromKey(key: string): Promise<DlqEntry[]> {
    const members = await this.connection.zrevrange(key, 0, -1);
    return members.flatMap((m) => {
      const entry = this.parseEntry(m);
      return entry !== null ? [entry] : [];
    });
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, batch] = await this.connection.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');

    return keys;
  }

  private parseEntry(raw: string): DlqEntry | null {
    try {
      return JSON.parse(raw) as DlqEntry;
    } catch {
      return null;
    }
  }

  private toKey(queueName: string, jobName: string): string {
    return `${DLQ_KEY_PREFIX}:${queueName}:${jobName}`;
  }
}
