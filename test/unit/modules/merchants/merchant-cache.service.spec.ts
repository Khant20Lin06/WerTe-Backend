import { MerchantStatus, UserRole, UserStatus } from '@prisma/client';

import { CacheMetricsService } from '../../../../src/infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../../src/infrastructure/redis/redis.service';
import { MerchantOwnershipRecord } from '../../../../src/modules/merchants/entities/merchant-ownership.entity';
import { MerchantCacheService } from '../../../../src/modules/merchants/services/merchant-cache.service';

describe('MerchantCacheService', () => {
  const makeMerchant = (
    overrides?: Partial<MerchantOwnershipRecord>,
  ): MerchantOwnershipRecord => ({
    id: 'merchant_1',
    userId: 'usr_1',
    name: 'Tea House',
    supportPhone: '0942000000',
    storeType: 'restaurant',
    primaryStoreTypeId: 'store_type_restaurant',
    status: MerchantStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
    },
    ...overrides,
  });

  const makeRedis = (stored: Record<string, string> = {}) =>
    ({
      get: jest.fn((key: string) => Promise.resolve(stored[key] ?? null)),
      set: jest.fn(() => Promise.resolve('OK')),
      del: jest.fn(() => Promise.resolve(1)),
    }) as unknown as jest.Mocked<RedisService>;

  const makeCacheMetrics = () =>
    ({
      hit: jest.fn(),
      miss: jest.fn(),
    }) as unknown as jest.Mocked<CacheMetricsService>;

  describe('getById', () => {
    it('returns null on cache miss', async () => {
      const service = new MerchantCacheService(makeRedis(), makeCacheMetrics());
      expect(await service.getById('merchant_1')).toBeNull();
    });

    it('returns parsed record on cache hit', async () => {
      const merchant = makeMerchant();
      const serialized = JSON.stringify(merchant);
      const redis = makeRedis({ 'merchant:id:merchant_1': serialized });
      const service = new MerchantCacheService(redis, makeCacheMetrics());

      const result = await service.getById('merchant_1');
      expect(result).toEqual(JSON.parse(serialized));
    });
  });

  describe('setById', () => {
    it('stores merchant under id key with TTL', async () => {
      const redis = makeRedis();
      const service = new MerchantCacheService(redis, makeCacheMetrics());
      const merchant = makeMerchant();

      await service.setById(merchant);

      expect(redis.set).toHaveBeenCalledWith(
        'merchant:id:merchant_1',
        JSON.stringify(merchant),
        'EX',
        600,
      );
    });
  });

  describe('getByUserId', () => {
    it('returns null on cache miss', async () => {
      const service = new MerchantCacheService(makeRedis(), makeCacheMetrics());
      expect(await service.getByUserId('usr_1')).toBeNull();
    });

    it('returns parsed record on cache hit', async () => {
      const merchant = makeMerchant();
      const serialized = JSON.stringify(merchant);
      const redis = makeRedis({ 'merchant:user:usr_1': serialized });
      const service = new MerchantCacheService(redis, makeCacheMetrics());

      const result = await service.getByUserId('usr_1');
      expect(result).toEqual(JSON.parse(serialized));
    });
  });

  describe('setByUserId', () => {
    it('stores merchant under userId key with TTL', async () => {
      const redis = makeRedis();
      const service = new MerchantCacheService(redis, makeCacheMetrics());
      const merchant = makeMerchant();

      await service.setByUserId('usr_1', merchant);

      expect(redis.set).toHaveBeenCalledWith(
        'merchant:user:usr_1',
        JSON.stringify(merchant),
        'EX',
        600,
      );
    });
  });

  describe('invalidate', () => {
    it('deletes both id and userId keys', async () => {
      const redis = makeRedis();
      const service = new MerchantCacheService(redis, makeCacheMetrics());

      await service.invalidate('merchant_1', 'usr_1');

      expect(redis.del).toHaveBeenCalledWith(
        'merchant:id:merchant_1',
        'merchant:user:usr_1',
      );
    });
  });
});
