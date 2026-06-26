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
exports.StoreTypeCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_metrics_service_1 = require("../../../infrastructure/metrics/cache-metrics.service");
const redis_service_1 = require("../../../infrastructure/redis/redis.service");
const TTL_SECONDS = 3600;
const KEY = {
    list: 'store-type:list:all',
    listActive: 'store-type:list:active',
    byId: (id) => `store-type:id:${id}`,
    byCode: (code) => `store-type:code:${code}`,
};
const CACHE_NAME = 'store-type';
let StoreTypeCacheService = class StoreTypeCacheService {
    constructor(redis, cacheMetrics) {
        this.redis = redis;
        this.cacheMetrics = cacheMetrics;
    }
    async getList() {
        return this.getMany(KEY.list);
    }
    async setList(records) {
        await this.setMany(KEY.list, records);
    }
    async getActiveList() {
        return this.getMany(KEY.listActive);
    }
    async setActiveList(records) {
        await this.setMany(KEY.listActive, records);
    }
    async getById(id) {
        return this.getOne(KEY.byId(id));
    }
    async setById(record) {
        await this.setOne(KEY.byId(record.id), record);
    }
    async getByCode(code) {
        return this.getOne(KEY.byCode(code));
    }
    async setByCode(code, record) {
        await this.setOne(KEY.byCode(code), record);
    }
    async invalidateOne(id, code) {
        await this.redis.del(KEY.byId(id), KEY.byCode(code), KEY.list, KEY.listActive);
    }
    async invalidateAll() {
        await this.redis.del(KEY.list, KEY.listActive);
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
    async getMany(key) {
        const raw = await this.redis.get(key);
        if (raw === null) {
            this.cacheMetrics.miss(CACHE_NAME);
            return null;
        }
        this.cacheMetrics.hit(CACHE_NAME);
        return JSON.parse(raw);
    }
    async setMany(key, value) {
        await this.redis.set(key, JSON.stringify(value), 'EX', TTL_SECONDS);
    }
};
exports.StoreTypeCacheService = StoreTypeCacheService;
exports.StoreTypeCacheService = StoreTypeCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        cache_metrics_service_1.CacheMetricsService])
], StoreTypeCacheService);
//# sourceMappingURL=store-type-cache.service.js.map