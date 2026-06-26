import { Injectable } from '@nestjs/common';

import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';

// Branch lookups happen on every merchant API call (ownership checks).
// List by merchant is fetched whenever the merchant views their branch list.
// 10-minute TTL; invalidated on any write to the branch.
const TTL_SECONDS = 600;

const KEY = {
  byId: (id: string) => `branch:id:${id}`,
  listByMerchantId: (merchantId: string) => `branch:merchant:${merchantId}`,
} as const;

const CACHE_NAME = 'branch';

@Injectable()
export class BranchCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
  ) {}

  async getById(id: string): Promise<BranchOwnershipRecord | null> {
    return this.getOne(KEY.byId(id));
  }

  async setById(branch: BranchOwnershipRecord): Promise<void> {
    await this.setOne(KEY.byId(branch.id), branch);
  }

  async getListByMerchantId(
    merchantId: string,
  ): Promise<BranchOwnershipRecord[] | null> {
    const raw = await this.redis.get(KEY.listByMerchantId(merchantId));
    if (raw === null) {
      this.cacheMetrics.miss(CACHE_NAME);
      return null;
    }
    this.cacheMetrics.hit(CACHE_NAME);
    return JSON.parse(raw) as BranchOwnershipRecord[];
  }

  async setListByMerchantId(
    merchantId: string,
    branches: BranchOwnershipRecord[],
  ): Promise<void> {
    await this.redis.set(
      KEY.listByMerchantId(merchantId),
      JSON.stringify(branches),
      'EX',
      TTL_SECONDS,
    );
  }

  async invalidate(branchId: string, merchantId: string): Promise<void> {
    await this.redis.del(
      KEY.byId(branchId),
      KEY.listByMerchantId(merchantId),
    );
  }

  private async getOne(key: string): Promise<BranchOwnershipRecord | null> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      this.cacheMetrics.miss(CACHE_NAME);
      return null;
    }
    this.cacheMetrics.hit(CACHE_NAME);
    return JSON.parse(raw) as BranchOwnershipRecord;
  }

  private async setOne(key: string, value: BranchOwnershipRecord): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS);
  }
}
