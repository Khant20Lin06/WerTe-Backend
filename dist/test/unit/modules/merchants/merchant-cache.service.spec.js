"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const merchant_cache_service_1 = require("../../../../src/modules/merchants/services/merchant-cache.service");
describe('MerchantCacheService', () => {
    const makeMerchant = (overrides) => ({
        id: 'merchant_1',
        userId: 'usr_1',
        name: 'Tea House',
        supportPhone: '0942000000',
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        status: client_1.MerchantStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
        },
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
    describe('getById', () => {
        it('returns null on cache miss', async () => {
            const service = new merchant_cache_service_1.MerchantCacheService(makeRedis(), makeCacheMetrics());
            expect(await service.getById('merchant_1')).toBeNull();
        });
        it('returns parsed record on cache hit', async () => {
            const merchant = makeMerchant();
            const serialized = JSON.stringify(merchant);
            const redis = makeRedis({ 'merchant:id:merchant_1': serialized });
            const service = new merchant_cache_service_1.MerchantCacheService(redis, makeCacheMetrics());
            const result = await service.getById('merchant_1');
            expect(result).toEqual(JSON.parse(serialized));
        });
    });
    describe('setById', () => {
        it('stores merchant under id key with TTL', async () => {
            const redis = makeRedis();
            const service = new merchant_cache_service_1.MerchantCacheService(redis, makeCacheMetrics());
            const merchant = makeMerchant();
            await service.setById(merchant);
            expect(redis.set).toHaveBeenCalledWith('merchant:id:merchant_1', JSON.stringify(merchant), 'EX', 600);
        });
    });
    describe('getByUserId', () => {
        it('returns null on cache miss', async () => {
            const service = new merchant_cache_service_1.MerchantCacheService(makeRedis(), makeCacheMetrics());
            expect(await service.getByUserId('usr_1')).toBeNull();
        });
        it('returns parsed record on cache hit', async () => {
            const merchant = makeMerchant();
            const serialized = JSON.stringify(merchant);
            const redis = makeRedis({ 'merchant:user:usr_1': serialized });
            const service = new merchant_cache_service_1.MerchantCacheService(redis, makeCacheMetrics());
            const result = await service.getByUserId('usr_1');
            expect(result).toEqual(JSON.parse(serialized));
        });
    });
    describe('setByUserId', () => {
        it('stores merchant under userId key with TTL', async () => {
            const redis = makeRedis();
            const service = new merchant_cache_service_1.MerchantCacheService(redis, makeCacheMetrics());
            const merchant = makeMerchant();
            await service.setByUserId('usr_1', merchant);
            expect(redis.set).toHaveBeenCalledWith('merchant:user:usr_1', JSON.stringify(merchant), 'EX', 600);
        });
    });
    describe('invalidate', () => {
        it('deletes both id and userId keys', async () => {
            const redis = makeRedis();
            const service = new merchant_cache_service_1.MerchantCacheService(redis, makeCacheMetrics());
            await service.invalidate('merchant_1', 'usr_1');
            expect(redis.del).toHaveBeenCalledWith('merchant:id:merchant_1', 'merchant:user:usr_1');
        });
    });
});
//# sourceMappingURL=merchant-cache.service.spec.js.map