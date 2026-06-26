import { Injectable } from '@nestjs/common';

import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';

// Store discovery is the highest-traffic customer read — every store browse
// hits it. TTL 5 min: short enough that branch status/store-type changes
// propagate quickly; long enough to absorb traffic spikes.
//
// Cacheable subset: requests with no keyword, no specific branchId, and no
// specific merchantId. Keyword searches and targeted lookups are skipped
// (unbounded key space or single-use by nature).
//
// Stampede protection: Probabilistic Early Expiry (PER). When the remaining
// TTL drops below EARLY_EXPIRY_WINDOW (the last 20% of TTL = 60s), each
// request has a STAMPEDE_PROBABILITY (50%) chance of treating the entry as a
// miss. This staggers cache refreshes across the window instead of letting
// all concurrent requests hit the DB simultaneously at the hard expiry.
const TTL_SECONDS = 300;
const EARLY_EXPIRY_FACTOR = 0.2; // trigger PER check in last 20% of TTL
const STAMPEDE_PROBABILITY = 0.5; // 50% chance each request triggers refresh

export type DiscoveryFilter = {
  storeTypeCodes?: string[];
  township?: string;
};

const KEY = {
  list: (storeTypeCodes: string[] | undefined, township: string | undefined) => {
    const codesSegment =
      storeTypeCodes !== undefined && storeTypeCodes.length > 0
        ? storeTypeCodes.slice().sort().join(',')
        : 'all';
    const townshipSegment = township ?? 'all';
    return `store-discovery:list:${codesSegment}:${townshipSegment}`;
  },
} as const;

const CACHE_NAME = 'store-discovery';

@Injectable()
export class DiscoveryCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
  ) {}

  isCacheable(filter: {
    branchId?: string;
    merchantId?: string;
    keyword?: string;
    storeTypeCodes?: string[];
    township?: string;
  }): boolean {
    // Skip cache for targeted or full-text lookups — key space too large.
    return (
      filter.branchId === undefined &&
      filter.merchantId === undefined &&
      filter.keyword === undefined
    );
  }

  async getList(
    filter: DiscoveryFilter,
  ): Promise<CustomerStoreDiscoveryRecord[] | null> {
    const key = KEY.list(filter.storeTypeCodes, filter.township);
    const [raw, remainingTtl] = await Promise.all([
      this.redis.get(key),
      this.redis.ttl(key),
    ]);

    if (raw === null) {
      this.cacheMetrics.miss(CACHE_NAME);
      return null;
    }

    // Probabilistic Early Expiry: stagger refreshes across the final window
    // of the TTL so concurrent requests do not all rebuild the cache at once.
    const earlyWindow = TTL_SECONDS * EARLY_EXPIRY_FACTOR;
    if (remainingTtl >= 0 && remainingTtl < earlyWindow && Math.random() < STAMPEDE_PROBABILITY) {
      this.cacheMetrics.miss(CACHE_NAME);
      return null;
    }

    this.cacheMetrics.hit(CACHE_NAME);
    return JSON.parse(raw) as CustomerStoreDiscoveryRecord[];
  }

  async setList(
    filter: DiscoveryFilter,
    records: CustomerStoreDiscoveryRecord[],
  ): Promise<void> {
    await this.redis.set(
      KEY.list(filter.storeTypeCodes, filter.township),
      JSON.stringify(records),
      'EX',
      TTL_SECONDS,
    );
  }

  async invalidateAll(): Promise<void> {
    // SCAN instead of KEYS to avoid blocking Redis on large keyspaces.
    // ioredis keyPrefix is prepended automatically to the SCAN MATCH pattern.
    const prefix = this.redis.options.keyPrefix ?? '';
    const pattern = `${prefix}store-discovery:list:*`;
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        // Strip keyPrefix from returned keys before passing to del —
        // ioredis re-adds the prefix on write commands.
        const stripped = keys.map((k) =>
          prefix.length > 0 && k.startsWith(prefix) ? k.slice(prefix.length) : k,
        );
        await this.redis.del(...stripped);
      }
    } while (cursor !== '0');
  }
}
