import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
export declare class MerchantCacheService {
    private readonly redis;
    private readonly cacheMetrics;
    constructor(redis: RedisService, cacheMetrics: CacheMetricsService);
    getById(id: string): Promise<MerchantOwnershipRecord | null>;
    setById(merchant: MerchantOwnershipRecord): Promise<void>;
    getByUserId(userId: string): Promise<MerchantOwnershipRecord | null>;
    setByUserId(userId: string, merchant: MerchantOwnershipRecord): Promise<void>;
    invalidate(merchantId: string, userId: string): Promise<void>;
    private get;
    private set;
}
