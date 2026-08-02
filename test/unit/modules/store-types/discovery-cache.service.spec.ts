import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../../src/infrastructure/metrics/cache-metrics.service';
import { DiscoveryCacheService } from '../../../../src/modules/store-types/services/discovery-cache.service';
import { RedisService } from '../../../../src/infrastructure/redis/redis.service';
import { CustomerStoreDiscoveryRecord } from '../../../../src/modules/store-types/entities/customer-store-discovery.entity';

const TTL_SECONDS = 300;
const EARLY_WINDOW = TTL_SECONDS * 0.2; // 60s

const makeRecord = (): CustomerStoreDiscoveryRecord =>
  ({
    id: 'branch_1',
    name: 'Main Branch',
  }) as unknown as CustomerStoreDiscoveryRecord;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMock = jest.MockedFunction<(...args: any[]) => any>;

type RedisMockOptions = {
  get?: AnyMock;
  ttl?: AnyMock;
  set?: AnyMock;
  del?: AnyMock;
  scan?: AnyMock;
  keyPrefix?: string;
};

const makeRedis = (opts: RedisMockOptions = {}) =>
  ({
    get: opts.get ?? jest.fn().mockResolvedValue(null),
    ttl: opts.ttl ?? jest.fn().mockResolvedValue(-2),
    set: opts.set ?? jest.fn().mockResolvedValue('OK'),
    del: opts.del ?? jest.fn().mockResolvedValue(1),
    scan: opts.scan ?? jest.fn().mockResolvedValue(['0', []]),
    options: { keyPrefix: opts.keyPrefix ?? '' },
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

describe('DiscoveryCacheService', () => {
  describe('isCacheable()', () => {
    let service: DiscoveryCacheService;
    beforeEach(() => { service = new DiscoveryCacheService(makeRedis(), makeCacheMetrics(), makeLogger()); });

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
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      const result = await service.getList({ storeTypeCodes: ['restaurant'] });

      expect(result).toBeNull();
    });

    it('returns parsed records when TTL is in the safe window (> 60s remaining)', async () => {
      const records = [makeRecord()];
      const redis = makeRedis({
        get: jest.fn().mockResolvedValue(JSON.stringify(records)),
        ttl: jest.fn().mockResolvedValue(200), // 200s remaining — well above 60s window
      });
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      const result = await service.getList({ township: 'Botahtaung' });

      expect(result).toEqual(records);
    });

    it('always returns records when TTL is exactly at the window boundary (60s)', async () => {
      const records = [makeRecord()];
      const redis = makeRedis({
        get: jest.fn().mockResolvedValue(JSON.stringify(records)),
        ttl: jest.fn().mockResolvedValue(60), // exactly at boundary — NOT inside early window
      });
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      // At 60s remaining (not < 60) PER should not trigger regardless of random.
      jest.spyOn(Math, 'random').mockReturnValue(0); // 0 < 0.5 would trigger if inside window
      const result = await service.getList({});
      jest.spyOn(Math, 'random').mockRestore();

      expect(result).toEqual(records);
    });

    describe('probabilistic early expiry (PER) — TTL inside early window (<60s)', () => {
      it('returns null (simulated miss) when random < 0.5 inside early window', async () => {
        const records = [makeRecord()];
        const redis = makeRedis({
          get: jest.fn().mockResolvedValue(JSON.stringify(records)),
          ttl: jest.fn().mockResolvedValue(30), // 30s remaining — inside 60s window
        });
        const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

        jest.spyOn(Math, 'random').mockReturnValue(0.3); // 0.3 < 0.5 → triggers refresh
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
        const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

        jest.spyOn(Math, 'random').mockReturnValue(0.7); // 0.7 >= 0.5 → serve cache
        const result = await service.getList({});
        jest.spyOn(Math, 'random').mockRestore();

        expect(result).toEqual(records);
      });

      it('never triggers PER when TTL is -1 (key has no expiry set)', async () => {
        // TTL = -1 means persistent key; PER guard requires `remainingTtl >= 0`
        const records = [makeRecord()];
        const redis = makeRedis({
          get: jest.fn().mockResolvedValue(JSON.stringify(records)),
          ttl: jest.fn().mockResolvedValue(-1),
        });
        const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

        jest.spyOn(Math, 'random').mockReturnValue(0); // would trigger if guard absent
        const result = await service.getList({});
        jest.spyOn(Math, 'random').mockRestore();

        expect(result).toEqual(records);
      });
    });
  });

  describe('setList()', () => {
    it('serializes records and stores with TTL_SECONDS expiry', async () => {
      const redis = makeRedis();
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());
      const records = [makeRecord()];
      const filter = { storeTypeCodes: ['restaurant'], township: 'YGN' };

      await service.setList(filter, records);

      expect(redis.set).toHaveBeenCalledWith(
        'store-discovery:list:restaurant:YGN',
        JSON.stringify(records),
        'EX',
        TTL_SECONDS,
      );
    });

    it('builds a sorted cache key so storeTypeCodes order does not create duplicates', async () => {
      const redis = makeRedis();
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      await service.setList({ storeTypeCodes: ['pharmacy', 'restaurant'] }, []);
      await service.setList({ storeTypeCodes: ['restaurant', 'pharmacy'] }, []);

      const calls = (redis.set as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe(calls[1][0]); // same key regardless of order
    });
  });

  describe('invalidateAll()', () => {
    it('deletes all matching keys found by SCAN', async () => {
      const redis = makeRedis({
        scan: jest.fn()
          .mockResolvedValueOnce(['0', ['store-discovery:list:all:all', 'store-discovery:list:restaurant:YGN']]),
        del: jest.fn().mockResolvedValue(2),
      });
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      await service.invalidateAll();

      expect(redis.del).toHaveBeenCalledWith(
        'store-discovery:list:all:all',
        'store-discovery:list:restaurant:YGN',
      );
    });

    it('strips keyPrefix from returned keys before calling del', async () => {
      const redis = makeRedis({
        scan: jest.fn()
          .mockResolvedValueOnce(['0', ['prefix:store-discovery:list:all:all']]),
        del: jest.fn().mockResolvedValue(1),
        keyPrefix: 'prefix:',
      });
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      await service.invalidateAll();

      expect(redis.del).toHaveBeenCalledWith('store-discovery:list:all:all');
    });

    it('does nothing when SCAN returns no keys', async () => {
      const redis = makeRedis({
        scan: jest.fn().mockResolvedValueOnce(['0', []]),
      });
      const service = new DiscoveryCacheService(redis, makeCacheMetrics(), makeLogger());

      await service.invalidateAll();

      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});
