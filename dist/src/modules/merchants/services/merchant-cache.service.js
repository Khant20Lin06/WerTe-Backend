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
exports.MerchantCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_metrics_service_1 = require("../../../infrastructure/metrics/cache-metrics.service");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const TTL_SECONDS = 600;
const KEY = {
    byId: (id) => `merchant:id:${id}`,
    byUserId: (userId) => `merchant:user:${userId}`,
};
const CACHE_NAME = 'merchant';
let MerchantCacheService = class MerchantCacheService {
    constructor(redis, cacheMetrics) {
        this.redis = redis;
        this.cacheMetrics = cacheMetrics;
    }
    async getById(id) {
        return this.get(KEY.byId(id));
    }
    async setById(merchant) {
        await this.set(KEY.byId(merchant.id), merchant);
    }
    async getByUserId(userId) {
        return this.get(KEY.byUserId(userId));
    }
    async setByUserId(userId, merchant) {
        await this.set(KEY.byUserId(userId), merchant);
    }
    async invalidate(merchantId, userId) {
        await this.redis.del(KEY.byId(merchantId), KEY.byUserId(userId));
    }
    async get(key) {
        const raw = await this.redis.get(key);
        if (raw === null) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        this.cacheMetrics.hit(CACHE_NAME);
        return JSON.parse(raw);
    }
    async set(key, value) {
        await this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS);
    }
};
exports.MerchantCacheService = MerchantCacheService;
exports.MerchantCacheService = MerchantCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        cache_metrics_service_1.CacheMetricsService])
], MerchantCacheService);
//# sourceMappingURL=merchant-cache.service.js.map