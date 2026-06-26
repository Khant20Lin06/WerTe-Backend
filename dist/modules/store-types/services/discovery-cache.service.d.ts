import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
export type DiscoveryFilter = {
    storeTypeCodes?: string[];
    township?: string;
};
export declare class DiscoveryCacheService {
    private readonly redis;
    private readonly cacheMetrics;
    constructor(redis: RedisService, cacheMetrics: CacheMetricsService);
    isCacheable(filter: {
        branchId?: string;
        merchantId?: string;
        keyword?: string;
        storeTypeCodes?: string[];
        township?: string;
    }): boolean;
    getList(filter: DiscoveryFilter): Promise<CustomerStoreDiscoveryRecord[] | null>;
    setList(filter: DiscoveryFilter, records: CustomerStoreDiscoveryRecord[]): Promise<void>;
    invalidateAll(): Promise<void>;
}
