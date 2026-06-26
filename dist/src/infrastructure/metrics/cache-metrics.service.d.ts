import { Counter } from 'prom-client';
export declare class CacheMetricsService {
    readonly cacheHitsTotal: Counter;
    readonly cacheMissesTotal: Counter;
    hit(cache: string): void;
    miss(cache: string): void;
}
