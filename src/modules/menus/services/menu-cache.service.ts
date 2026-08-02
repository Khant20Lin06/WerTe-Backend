import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { safeRedisOp } from '../../../infrastructure/redis/safe-redis-op';
import { BranchCatalogRecord } from '../entities/branch-catalog.entity';

// Full branch catalog (categories + items + options) fetched on every customer
// menu page view. 5-minute TTL; invalidated on any merchant menu write.
const TTL_SECONDS = 300;

const KEY = {
  catalog: (branchId: string) => `menu:branch:${branchId}`,
} as const;

const CACHE_NAME = 'menu';

@Injectable()
export class MenuCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
    private readonly logger: AppLogger,
  ) {}

  async getCatalog(branchId: string): Promise<BranchCatalogRecord | null> {
    return safeRedisOp('read', CACHE_NAME, this.logger, this.cacheMetrics, null, async () => {
      const raw = await this.redis.get(KEY.catalog(branchId));
      if (raw === null) {
        this.cacheMetrics.miss(CACHE_NAME);
        return null;
      }
      this.cacheMetrics.hit(CACHE_NAME);
      return JSON.parse(raw) as BranchCatalogRecord;
    });
  }

  async setCatalog(branchId: string, catalog: BranchCatalogRecord): Promise<void> {
    await safeRedisOp('write', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.set(KEY.catalog(branchId), JSON.stringify(catalog), 'EX', TTL_SECONDS),
    );
  }

  async invalidate(branchId: string): Promise<void> {
    await safeRedisOp('invalidate', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.del(KEY.catalog(branchId)),
    );
  }
}
