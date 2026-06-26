"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discovery_cache_service_1 = require("../../../../src/modules/store-types/services/discovery-cache.service");
const TTL_SECONDS = 300;
const EARLY_WINDOW = TTL_SECONDS * 0.2;
const makeRecord = () => ({
    id: 'branch_1',
    name: 'Main Branch',
});
const makeRedis = (opts = {}) => ({
    get: opts.get ?? jest.fn().mockResolvedValue(null),
    ttl: opts.ttl ?? jest.fn().mockResolvedValue(-2),
    set: opts.set ?? jest.fn().mockResolvedValue('OK'),
    del: opts.del ?? jest.fn().mockResolvedValue(1),
    scan: opts.scan ?? jest.fn().mockResolvedValue(['0', []]),
    options: { keyPrefix: opts.keyPrefix ?? '' },
});
const makeCacheMetrics = () => ({
    hit: jest.fn(),
    miss: jest.fn(),
});
describe('DiscoveryCacheService', () => {
    describe('isCacheable()', () => {
        let service;
        beforeEach(() => { service = new discovery_cache_service_1.DiscoveryCacheService(makeRedis(), makeCacheMetrics()); });
        it('returns true when filter has no targeted fields', () => {
            expect(service.isCacheable({ storeTypeCodes: ['restaurant'], township: 'YGN' })).toBe(true);
            expect(service.isCacheable({})).toBe(true);
        });
        it('returns false when branchId is present', () => {
            expect(service.isCacheable({ branchId: 'branch_1' })).toBe(false);
        });
        it('returns false when merchantId is present', () => {
            expect(service.isCacheable({ merchantId: 'merchant_1' })).toBe(false);
        });
        it('returns false when keyword is present', () => {
            expect(service.isCacheable({ keyword: 'sushi' })).toBe(false);
        });
    });
    describe('getList()', () => {
        it('returns null on a hard cache miss (key absent)', async () => {
            const redis = makeRedis({
                get: jest.fn().mockResolvedValue(null),
                ttl: jest.fn().mockResolvedValue(-2),
            });
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            const result = await service.getList({ storeTypeCodes: ['restaurant'] });
            expect(result).toBeNull();
        });
        it('returns parsed records when TTL is in the safe window (> 60s remaining)', async () => {
            const records = [makeRecord()];
            const redis = makeRedis({
                get: jest.fn().mockResolvedValue(JSON.stringify(records)),
                ttl: jest.fn().mockResolvedValue(200),
            });
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            const result = await service.getList({ township: 'Botahtaung' });
            expect(result).toEqual(records);
        });
        it('always returns records when TTL is exactly at the window boundary (60s)', async () => {
            const records = [makeRecord()];
            const redis = makeRedis({
                get: jest.fn().mockResolvedValue(JSON.stringify(records)),
                ttl: jest.fn().mockResolvedValue(60),
            });
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            jest.spyOn(Math, 'random').mockReturnValue(0);
            const result = await service.getList({});
            jest.spyOn(Math, 'random').mockRestore();
            expect(result).toEqual(records);
        });
        describe('probabilistic early expiry (PER) — TTL inside early window (<60s)', () => {
            it('returns null (simulated miss) when random < 0.5 inside early window', async () => {
                const records = [makeRecord()];
                const redis = makeRedis({
                    get: jest.fn().mockResolvedValue(JSON.stringify(records)),
                    ttl: jest.fn().mockResolvedValue(30),
                });
                const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
                jest.spyOn(Math, 'random').mockReturnValue(0.3);
                const result = await service.getList({});
                jest.spyOn(Math, 'random').mockRestore();
                expect(result).toBeNull();
            });
            it('returns cached records when random >= 0.5 inside early window', async () => {
                const records = [makeRecord()];
                const redis = makeRedis({
                    get: jest.fn().mockResolvedValue(JSON.stringify(records)),
                    ttl: jest.fn().mockResolvedValue(30),
                });
                const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
                jest.spyOn(Math, 'random').mockReturnValue(0.7);
                const result = await service.getList({});
                jest.spyOn(Math, 'random').mockRestore();
                expect(result).toEqual(records);
            });
            it('never triggers PER when TTL is -1 (key has no expiry set)', async () => {
                const records = [makeRecord()];
                const redis = makeRedis({
                    get: jest.fn().mockResolvedValue(JSON.stringify(records)),
                    ttl: jest.fn().mockResolvedValue(-1),
                });
                const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
                jest.spyOn(Math, 'random').mockReturnValue(0);
                const result = await service.getList({});
                jest.spyOn(Math, 'random').mockRestore();
                expect(result).toEqual(records);
            });
        });
    });
    describe('setList()', () => {
        it('serializes records and stores with TTL_SECONDS expiry', async () => {
            const redis = makeRedis();
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            const records = [makeRecord()];
            const filter = { storeTypeCodes: ['restaurant'], township: 'YGN' };
            await service.setList(filter, records);
            expect(redis.set).toHaveBeenCalledWith('store-discovery:list:restaurant:YGN', JSON.stringify(records), 'EX', TTL_SECONDS);
        });
        it('builds a sorted cache key so storeTypeCodes order does not create duplicates', async () => {
            const redis = makeRedis();
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            await service.setList({ storeTypeCodes: ['pharmacy', 'restaurant'] }, []);
            await service.setList({ storeTypeCodes: ['restaurant', 'pharmacy'] }, []);
            const calls = redis.set.mock.calls;
            expect(calls[0][0]).toBe(calls[1][0]);
        });
    });
    describe('invalidateAll()', () => {
        it('deletes all matching keys found by SCAN', async () => {
            const redis = makeRedis({
                scan: jest.fn()
                    .mockResolvedValueOnce(['0', ['store-discovery:list:all:all', 'store-discovery:list:restaurant:YGN']]),
                del: jest.fn().mockResolvedValue(2),
            });
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            await service.invalidateAll();
            expect(redis.del).toHaveBeenCalledWith('store-discovery:list:all:all', 'store-discovery:list:restaurant:YGN');
        });
        it('strips keyPrefix from returned keys before calling del', async () => {
            const redis = makeRedis({
                scan: jest.fn()
                    .mockResolvedValueOnce(['0', ['prefix:store-discovery:list:all:all']]),
                del: jest.fn().mockResolvedValue(1),
                keyPrefix: 'prefix:',
            });
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            await service.invalidateAll();
            expect(redis.del).toHaveBeenCalledWith('store-discovery:list:all:all');
        });
        it('does nothing when SCAN returns no keys', async () => {
            const redis = makeRedis({
                scan: jest.fn().mockResolvedValueOnce(['0', []]),
            });
            const service = new discovery_cache_service_1.DiscoveryCacheService(redis, makeCacheMetrics());
            await service.invalidateAll();
            expect(redis.del).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=discovery-cache.service.spec.js.map