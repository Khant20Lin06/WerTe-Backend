"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_type_cache_service_1 = require("../../../../src/modules/store-types/services/store-type-cache.service");
describe('StoreTypeCacheService', () => {
    const makeStoreType = (overrides) => ({
        id: 'store_type_restaurant',
        code: 'restaurant',
        name: 'Restaurant',
        description: 'Prepared food and beverage merchants.',
        iconUrl: null,
        isActive: true,
        isSystem: false,
        sortOrder: 0,
        createdAt: new Date('2026-04-30T00:00:00.000Z'),
        updatedAt: new Date('2026-04-30T00:00:00.000Z'),
        deletedAt: null,
        _count: { branchAssignments: 1, branchPrimaries: 1, merchantPrimaries: 1 },
        ...overrides,
    });
    const makeRedis = (stored = {}) => ({
        get: jest.fn((key) => Promise.resolve(stored[key] ?? null)),
        set: jest.fn(() => Promise.resolve('OK')),
        del: jest.fn(() => Promise.resolve(1)),
    });
    const makeCacheMetrics = () => ({
        hit: jest.fn(),
        miss: jest.fn(),
    });
    const TTL = 3600;
    describe('getList / setList', () => {
        it('returns null on cache miss', async () => {
            expect(await new store_type_cache_service_1.StoreTypeCacheService(makeRedis(), makeCacheMetrics()).getList()).toBeNull();
        });
        it('returns parsed array on cache hit', async () => {
            const records = [makeStoreType()];
            const serialized = JSON.stringify(records);
            const redis = makeRedis({ 'store-type:list:all': serialized });
            const result = await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).getList();
            expect(result).toEqual(JSON.parse(serialized));
        });
        it('stores list with correct key and TTL', async () => {
            const redis = makeRedis();
            const records = [makeStoreType()];
            await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).setList(records);
            expect(redis.set).toHaveBeenCalledWith('store-type:list:all', JSON.stringify(records), 'EX', TTL);
        });
    });
    describe('getActiveList / setActiveList', () => {
        it('returns null on cache miss', async () => {
            expect(await new store_type_cache_service_1.StoreTypeCacheService(makeRedis(), makeCacheMetrics()).getActiveList()).toBeNull();
        });
        it('returns parsed array on cache hit', async () => {
            const records = [makeStoreType()];
            const serialized = JSON.stringify(records);
            const redis = makeRedis({ 'store-type:list:active': serialized });
            const result = await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).getActiveList();
            expect(result).toEqual(JSON.parse(serialized));
        });
        it('stores active list with correct key and TTL', async () => {
            const redis = makeRedis();
            const records = [makeStoreType()];
            await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).setActiveList(records);
            expect(redis.set).toHaveBeenCalledWith('store-type:list:active', JSON.stringify(records), 'EX', TTL);
        });
    });
    describe('getById / setById', () => {
        it('returns null on cache miss', async () => {
            expect(await new store_type_cache_service_1.StoreTypeCacheService(makeRedis(), makeCacheMetrics()).getById('st_1')).toBeNull();
        });
        it('returns parsed record on cache hit', async () => {
            const record = makeStoreType({ id: 'st_1' });
            const serialized = JSON.stringify(record);
            const redis = makeRedis({ 'store-type:id:st_1': serialized });
            const result = await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).getById('st_1');
            expect(result).toEqual(JSON.parse(serialized));
        });
        it('stores record under id key with TTL', async () => {
            const redis = makeRedis();
            const record = makeStoreType({ id: 'st_1' });
            await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).setById(record);
            expect(redis.set).toHaveBeenCalledWith('store-type:id:st_1', JSON.stringify(record), 'EX', TTL);
        });
    });
    describe('getByCode / setByCode', () => {
        it('returns null on cache miss', async () => {
            expect(await new store_type_cache_service_1.StoreTypeCacheService(makeRedis(), makeCacheMetrics()).getByCode('grocery')).toBeNull();
        });
        it('returns parsed record on cache hit', async () => {
            const record = makeStoreType({ code: 'grocery' });
            const serialized = JSON.stringify(record);
            const redis = makeRedis({ 'store-type:code:grocery': serialized });
            const result = await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).getByCode('grocery');
            expect(result).toEqual(JSON.parse(serialized));
        });
        it('stores record under code key with TTL', async () => {
            const redis = makeRedis();
            const record = makeStoreType({ code: 'grocery' });
            await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).setByCode('grocery', record);
            expect(redis.set).toHaveBeenCalledWith('store-type:code:grocery', JSON.stringify(record), 'EX', TTL);
        });
    });
    describe('invalidateOne', () => {
        it('deletes id key, code key, and both list keys', async () => {
            const redis = makeRedis();
            await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).invalidateOne('st_1', 'restaurant');
            expect(redis.del).toHaveBeenCalledWith('store-type:id:st_1', 'store-type:code:restaurant', 'store-type:list:all', 'store-type:list:active');
        });
    });
    describe('invalidateAll', () => {
        it('deletes both list keys', async () => {
            const redis = makeRedis();
            await new store_type_cache_service_1.StoreTypeCacheService(redis, makeCacheMetrics()).invalidateAll();
            expect(redis.del).toHaveBeenCalledWith('store-type:list:all', 'store-type:list:active');
        });
    });
});
//# sourceMappingURL=store-type-cache.service.spec.js.map