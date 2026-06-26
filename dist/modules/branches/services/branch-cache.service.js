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
exports.BranchCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_metrics_service_1 = require("../../../infrastructure/metrics/cache-metrics.service");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const TTL_SECONDS = 600;
const KEY = {
    byId: (id) => `branch:id:${id}`,
    listByMerchantId: (merchantId) => `branch:merchant:${merchantId}`,
};
const CACHE_NAME = 'branch';
let BranchCacheService = class BranchCacheService {
    constructor(redis, cacheMetrics) {
        this.redis = redis;
        this.cacheMetrics = cacheMetrics;
    }
    async getById(id) {
        return this.getOne(KEY.byId(id));
    }
    async setById(branch) {
        await this.setOne(KEY.byId(branch.id), branch);
    }
    async getListByMerchantId(merchantId) {
        const raw = await this.redis.get(KEY.listByMerchantId(merchantId));
        if (raw === null) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        this.cacheMetrics.hit(CACHE_NAME);
        return JSON.parse(raw);
    }
    async setListByMerchantId(merchantId, branches) {
        await this.redis.set(KEY.listByMerchantId(merchantId), JSON.stringify(branches), 'EX', TTL_SECONDS);
    }
    async invalidate(branchId, merchantId) {
        await this.redis.del(KEY.byId(branchId), KEY.listByMerchantId(merchantId));
    }
    async getOne(key) {
        const raw = await this.redis.get(key);
        if (raw === null) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        this.cacheMetrics.hit(CACHE_NAME);
        return JSON.parse(raw);
    }
    async setOne(key, value) {
        await this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS);
    }
};
exports.BranchCacheService = BranchCacheService;
exports.BranchCacheService = BranchCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        cache_metrics_service_1.CacheMetricsService])
], BranchCacheService);
//# sourceMappingURL=branch-cache.service.js.map