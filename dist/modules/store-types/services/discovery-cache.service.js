"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_metrics_service_1 = require("../../../infrastructure/metrics/cache-metrics.service");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const TTL_SECONDS = 300;
const EARLY_EXPIRY_FACTOR = 0.2;
const STAMPEDE_PROBABILITY = 0.5;
const KEY = {
    list: (storeTypeCodes, township) => {
        const codesSegment = storeTypeCodes !== undefined && storeTypeCodes.length > 0
            ? storeTypeCodes.slice().sort().join(',')
            : 'all';
        const townshipSegment = township ?? 'all';
        return `store-discovery:list:${codesSegment}:${townshipSegment}`;
    },
};
const CACHE_NAME = 'store-discovery';
let DiscoveryCacheService = class DiscoveryCacheService {
    constructor(redis, cacheMetrics) {
        this.redis = redis;
        this.cacheMetrics = cacheMetrics;
    }
    isCacheable(filter) {
        return (filter.branchId === undefined &&
            filter.merchantId === undefined &&
            filter.keyword === undefined);
    }
    async getList(filter) {
        const key = KEY.list(filter.storeTypeCodes, filter.township);
        const [raw, remainingTtl] = await Promise.all([
            this.redis.get(key),
            this.redis.ttl(key),
        ]);
        if (raw === null) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        const earlyWindow = TTL_SECONDS * EARLY_EXPIRY_FACTOR;
        if (remainingTtl >= 0 && remainingTtl < earlyWindow && Math.random() < STAMPEDE_PROBABILITY) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        this.cacheMetrics.hit(CACHE_NAME);
        return JSON.parse(raw);
    }
    async setList(filter, records) {
        await this.redis.set(KEY.list(filter.storeTypeCodes, filter.township), JSON.stringify(records), 'EX', TTL_SECONDS);
    }
    async invalidateAll() {
        const prefix = this.redis.options.keyPrefix ?? '';
        const pattern = `${prefix}store-discovery:list:*`;
        let cursor = '0';
        do {
            const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                const stripped = keys.map((k) => prefix.length > 0 && k.startsWith(prefix) ? k.slice(prefix.length) : k);
                await this.redis.del(...stripped);
            }
        } while (cursor !== '0');
    }
};
exports.DiscoveryCacheService = DiscoveryCacheService;
exports.DiscoveryCacheService = DiscoveryCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        cache_metrics_service_1.CacheMetricsService])
], DiscoveryCacheService);
//# sourceMappingURL=discovery-cache.service.js.map