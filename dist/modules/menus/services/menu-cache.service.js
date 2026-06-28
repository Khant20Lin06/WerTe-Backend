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
exports.MenuCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_metrics_service_1 = require("../../../infrastructure/metrics/cache-metrics.service");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const TTL_SECONDS = 300;
const KEY = {
    catalog: (branchId) => `menu:branch:${branchId}`,
};
const CACHE_NAME = 'menu';
let MenuCacheService = class MenuCacheService {
    constructor(redis, cacheMetrics) {
        this.redis = redis;
        this.cacheMetrics = cacheMetrics;
    }
    async getCatalog(branchId) {
        const raw = await this.redis.get(KEY.catalog(branchId));
        if (raw === null) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        this.cacheMetrics.hit(CACHE_NAME);
        return JSON.parse(raw);
    }
    async setCatalog(branchId, catalog) {
        await this.redis.set(KEY.catalog(branchId), JSON.stringify(catalog), 'EX', TTL_SECONDS);
    }
    async invalidate(branchId) {
        await this.redis.del(KEY.catalog(branchId));
    }
};
exports.MenuCacheService = MenuCacheService;
exports.MenuCacheService = MenuCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        cache_metrics_service_1.CacheMetricsService])
], MenuCacheService);
//# sourceMappingURL=menu-cache.service.js.map