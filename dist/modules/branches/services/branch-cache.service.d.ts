import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';
export declare class BranchCacheService {
    private readonly redis;
    private readonly cacheMetrics;
    constructor(redis: RedisService, cacheMetrics: CacheMetricsService);
    getById(id: string): Promise<BranchOwnershipRecord | null>;
    setById(branch: BranchOwnershipRecord): Promise<void>;
    getListByMerchantId(merchantId: string): Promise<BranchOwnershipRecord[] | null>;
    setListByMerchantId(merchantId: string, branches: BranchOwnershipRecord[]): Promise<void>;
    invalidate(branchId: string, merchantId: string): Promise<void>;
    private getOne;
    private setOne;
}
