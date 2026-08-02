import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../../src/infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../../src/infrastructure/redis/redis.service';
import { StoreTypeManagementRecord } from '../../../../src/modules/store-types/entities/store-type-management.entity';
import { StoreTypeCacheService } from '../../../../src/modules/store-types/services/store-type-cache.service';

describe('StoreTypeCacheService', () => {
  const makeStoreType = (
    overrides?: Partial<StoreTypeManagementRecord>,
  ): StoreTypeManagementRecord => ({
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
      error: jest.fn(),
    }) as unknown as jest.Mocked<CacheMetricsService>;

  const makeLogger = () =>
    ({
      warnEvent: jest.fn(),
      errorEvent: jest.fn(),
    }) as unknown as jest.Mocked<AppLogger>;

  const TTL = 3600;

  // ── list (all) ───────────────────────────────────────────────────────────

  describe('getList / setList', () => {
    it('returns null on cache miss', async () => {
      expect(await new StoreTypeCacheService(makeRedis(), makeCacheMetrics(), makeLogger()).getList()).toBeNull();
    });

    it('returns parsed array on cache hit', async () => {
      const records = [makeStoreType()];
      const serialized = JSON.stringify(records);
      const redis = makeRedis({ 'store-type:list:all': serialized });
      const result = await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).getList();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('stores list with correct key and TTL', async () => {
      const redis = makeRedis();
      const records = [makeStoreType()];
      await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).setList(records);
      expect(redis.set).toHaveBeenCalledWith(
        'store-type:list:all',
        JSON.stringify(records),
        'EX',
        TTL,
      );
    });
  });

  // ── list (active) ─────────────────────────────────────────────────────────

  describe('getActiveList / setActiveList', () => {
    it('returns null on cache miss', async () => {
      expect(await new StoreTypeCacheService(makeRedis(), makeCacheMetrics(), makeLogger()).getActiveList()).toBeNull();
    });

    it('returns parsed array on cache hit', async () => {
      const records = [makeStoreType()];
      const serialized = JSON.stringify(records);
      const redis = makeRedis({ 'store-type:list:active': serialized });
      const result = await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).getActiveList();
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('stores active list with correct key and TTL', async () => {
      const redis = makeRedis();
      const records = [makeStoreType()];
      await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).setActiveList(records);
      expect(redis.set).toHaveBeenCalledWith(
        'store-type:list:active',
        JSON.stringify(records),
        'EX',
        TTL,
      );
    });
  });

  // ── single by id ──────────────────────────────────────────────────────────

  describe('getById / setById', () => {
    it('returns null on cache miss', async () => {
      expect(await new StoreTypeCacheService(makeRedis(), makeCacheMetrics(), makeLogger()).getById('st_1')).toBeNull();
    });

    it('returns parsed record on cache hit', async () => {
      const record = makeStoreType({ id: 'st_1' });
      const serialized = JSON.stringify(record);
      const redis = makeRedis({ 'store-type:id:st_1': serialized });
      const result = await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).getById('st_1');
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('stores record under id key with TTL', async () => {
      const redis = makeRedis();
      const record = makeStoreType({ id: 'st_1' });
      await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).setById(record);
      expect(redis.set).toHaveBeenCalledWith(
        'store-type:id:st_1',
        JSON.stringify(record),
        'EX',
        TTL,
      );
    });
  });

  // ── single by code ────────────────────────────────────────────────────────

  describe('getByCode / setByCode', () => {
    it('returns null on cache miss', async () => {
      expect(await new StoreTypeCacheService(makeRedis(), makeCacheMetrics(), makeLogger()).getByCode('grocery')).toBeNull();
    });

    it('returns parsed record on cache hit', async () => {
      const record = makeStoreType({ code: 'grocery' });
      const serialized = JSON.stringify(record);
      const redis = makeRedis({ 'store-type:code:grocery': serialized });
      const result = await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).getByCode('grocery');
      expect(result).toEqual(JSON.parse(serialized));
    });

    it('stores record under code key with TTL', async () => {
      const redis = makeRedis();
      const record = makeStoreType({ code: 'grocery' });
      await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).setByCode('grocery', record);
      expect(redis.set).toHaveBeenCalledWith(
        'store-type:code:grocery',
        JSON.stringify(record),
        'EX',
        TTL,
      );
    });
  });

  // ── invalidation ──────────────────────────────────────────────────────────

  describe('invalidateOne', () => {
    it('deletes id key, code key, and both list keys', async () => {
      const redis = makeRedis();
      await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).invalidateOne('st_1', 'restaurant');
      expect(redis.del).toHaveBeenCalledWith(
        'store-type:id:st_1',
        'store-type:code:restaurant',
        'store-type:list:all',
        'store-type:list:active',
      );
    });
  });

  describe('invalidateAll', () => {
    it('deletes both list keys', async () => {
      const redis = makeRedis();
      await new StoreTypeCacheService(redis, makeCacheMetrics(), makeLogger()).invalidateAll();
      expect(redis.del).toHaveBeenCalledWith(
        'store-type:list:all',
        'store-type:list:active',
      );
    });
  });
});
