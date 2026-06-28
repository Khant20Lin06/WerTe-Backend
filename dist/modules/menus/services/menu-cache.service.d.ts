import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { BranchCatalogRecord } from '../entities/branch-catalog.entity';
export declare class MenuCacheService {
    private readonly redis;
    private readonly cacheMetrics;
    constructor(redis: RedisService, cacheMetrics: CacheMetricsService);
    getCatalog(branchId: string): Promise<BranchCatalogRecord | null>;
    setCatalog(branchId: string, catalog: BranchCatalogRecord): Promise<void>;
    invalidate(branchId: string): Promise<void>;
}
