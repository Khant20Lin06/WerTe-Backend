import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { safeRedisOp } from '../../../infrastructure/redis/safe-redis-op';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';

// Merchants are written rarely (profile updates, admin status changes) but
// read on every authenticated merchant request. 10-minute TTL matches the
// session cache ceiling — a revoked / suspended merchant will be evicted
// within the same window the session itself expires.
const TTL_SECONDS = 600;

const KEY = {
  byId: (id: string) => `merchant:id:${id}`,
  byUserId: (userId: string) => `merchant:user:${userId}`,
} as const;

const CACHE_NAME = 'merchant';

@Injectable()
export class MerchantCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
    private readonly logger: AppLogger,
  ) {}

  async getById(id: string): Promise<MerchantOwnershipRecord | null> {
    return this.get(KEY.byId(id));
  }

  async setById(merchant: MerchantOwnershipRecord): Promise<void> {
    await this.set(KEY.byId(merchant.id), merchant);
  }

  async getByUserId(userId: string): Promise<MerchantOwnershipRecord | null> {
    return this.get(KEY.byUserId(userId));
  }

  async setByUserId(
    userId: string,
    merchant: MerchantOwnershipRecord,
  ): Promise<void> {
    await this.set(KEY.byUserId(userId), merchant);
  }

  async invalidate(merchantId: string, userId: string): Promise<void> {
    await safeRedisOp('invalidate', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.del(KEY.byId(merchantId), KEY.byUserId(userId)),
    );
  }

  private async get(key: string): Promise<MerchantOwnershipRecord | null> {
    return safeRedisOp('read', CACHE_NAME, this.logger, this.cacheMetrics, null, async () => {
      const raw = await this.redis.get(key);
      if (raw === null) {
        this.cacheMetrics.miss(CACHE_NAME);
        return null;
      }
      this.cacheMetrics.hit(CACHE_NAME);
      return JSON.parse(raw) as MerchantOwnershipRecord;
    });
  }

  private async set(key: string, value: MerchantOwnershipRecord): Promise<void> {
    await safeRedisOp('write', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS),
    );
  }
}
