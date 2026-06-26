import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';
export declare class StoreTypeCacheService {
    private readonly redis;
    private readonly cacheMetrics;
    constructor(redis: RedisService, cacheMetrics: CacheMetricsService);
    getList(): Promise<StoreTypeManagementRecord[] | null>;
    setList(records: StoreTypeManagementRecord[]): Promise<void>;
    getActiveList(): Promise<StoreTypeManagementRecord[] | null>;
    setActiveList(records: StoreTypeManagementRecord[]): Promise<void>;
    getById(id: string): Promise<StoreTypeManagementRecord | null>;
    setById(record: StoreTypeManagementRecord): Promise<void>;
    getByCode(code: string): Promise<StoreTypeManagementRecord | null>;
    setByCode(code: string, record: StoreTypeManagementRecord): Promise<void>;
    invalidateOne(id: string, code: string): Promise<void>;
    invalidateAll(): Promise<void>;
    private getOne;
    private setOne;
    private getMany;
    private setMany;
}
