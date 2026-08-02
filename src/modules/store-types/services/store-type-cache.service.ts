import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { safeRedisOp } from '../../../infrastructure/redis/safe-redis-op';
import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';

// Store types are essentially static reference data — they change only when an
// admin adds, edits, or deletes a store type. Cache aggressively (1 hour) and
// invalidate explicitly on every write.
const TTL_SECONDS = 3600;

const KEY = {
  list: 'store-type:list:all',
  listActive: 'store-type:list:active',
  byId: (id: string) => `store-type:id:${id}`,
  byCode: (code: string) => `store-type:code:${code}`,
} as const;

const CACHE_NAME = 'store-type';

@Injectable()
export class StoreTypeCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
    private readonly logger: AppLogger,
  ) {}

  // --- list (all) ---

  async getList(): Promise<StoreTypeManagementRecord[] | null> {
    return this.getMany(KEY.list);
  }

  async setList(records: StoreTypeManagementRecord[]): Promise<void> {
    await this.setMany(KEY.list, records);
  }

  // --- list (active only) ---

  async getActiveList(): Promise<StoreTypeManagementRecord[] | null> {
    return this.getMany(KEY.listActive);
  }

  async setActiveList(records: StoreTypeManagementRecord[]): Promise<void> {
    await this.setMany(KEY.listActive, records);
  }

  // --- single by id ---

  async getById(id: string): Promise<StoreTypeManagementRecord | null> {
    return this.getOne(KEY.byId(id));
  }

  async setById(record: StoreTypeManagementRecord): Promise<void> {
    await this.setOne(KEY.byId(record.id), record);
  }

  // --- single by code ---

  async getByCode(code: string): Promise<StoreTypeManagementRecord | null> {
    return this.getOne(KEY.byCode(code));
  }

  async setByCode(code: string, record: StoreTypeManagementRecord): Promise<void> {
    await this.setOne(KEY.byCode(code), record);
  }

  // --- invalidation ---

  async invalidateOne(id: string, code: string): Promise<void> {
    // A single record change also stales both list views.
    await safeRedisOp('invalidate', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.del(KEY.byId(id), KEY.byCode(code), KEY.list, KEY.listActive),
    );
  }

  async invalidateAll(): Promise<void> {
    await safeRedisOp('invalidate', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.del(KEY.list, KEY.listActive),
    );
  }

  // --- helpers ---

  private async getOne(key: string): Promise<StoreTypeManagementRecord | null> {
    return safeRedisOp('read', CACHE_NAME, this.logger, this.cacheMetrics, null, async () => {
      const raw = await this.redis.get(key);
      if (raw === null) {
        this.cacheMetrics.miss(CACHE_NAME);
        return null;
      }
      this.cacheMetrics.hit(CACHE_NAME);
      return JSON.parse(raw) as StoreTypeManagementRecord;
    });
  }

  private async setOne(key: string, value: StoreTypeManagementRecord): Promise<void> {
    await safeRedisOp('write', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS),
    );
  }

  private async getMany(key: string): Promise<StoreTypeManagementRecord[] | null> {
    return safeRedisOp('read', CACHE_NAME, this.logger, this.cacheMetrics, null, async () => {
      const raw = await this.redis.get(key);
      if (raw === null) {
        this.cacheMetrics.miss(CACHE_NAME);
        return null;
      }
      this.cacheMetrics.hit(CACHE_NAME);
      return JSON.parse(raw) as StoreTypeManagementRecord[];
    });
  }

  private async setMany(key: string, value: StoreTypeManagementRecord[]): Promise<void> {
    await safeRedisOp('write', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS),
    );
  }
}
