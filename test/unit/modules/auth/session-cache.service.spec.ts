import { UserRole, UserStatus } from '@prisma/client';

import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../../src/infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../../src/infrastructure/redis/redis.service';
import { SessionCacheService } from '../../../../src/modules/auth/services/session-cache.service';

describe('SessionCacheService', () => {
  const cachedSession = {
    userId: 'usr_1',
    revokedAt: null,
    expiresAt: '2026-05-01T00:00:00.000Z',
    user: {
      id: 'usr_1',
      phone: '0999999999',
      passwordHash: 'hash',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      lastLoginAt: null,
      customerProfile: { id: 'cust_1' },
      riderProfile: null,
      merchantProfile: null,
      staffProfile: null,
    },
  };

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

  describe('get', () => {
    it('returns null on a real cache miss', async () => {
      const redis = { get: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<RedisService>;
      const service = new SessionCacheService(redis, makeCacheMetrics(), makeLogger());

      await expect(service.get('sess_1')).resolves.toBeNull();
    });

    it('returns the parsed session on a cache hit', async () => {
      const redis = {
        get: jest.fn().mockResolvedValue(JSON.stringify(cachedSession)),
      } as unknown as jest.Mocked<RedisService>;
      const service = new SessionCacheService(redis, makeCacheMetrics(), makeLogger());

      // Round-tripped through JSON, so Date fields come back as ISO strings.
      await expect(service.get('sess_1')).resolves.toEqual(
        JSON.parse(JSON.stringify(cachedSession)),
      );
    });

    it('degrades to null (not a thrown error) when Redis is unreachable', async () => {
      const redis = {
        get: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      } as unknown as jest.Mocked<RedisService>;
      const cacheMetrics = makeCacheMetrics();
      const service = new SessionCacheService(redis, cacheMetrics, makeLogger());

      // A null return here is what lets JwtStrategy.validate() fall through
      // to a Postgres-backed lookup instead of the request failing outright.
      await expect(service.get('sess_1')).resolves.toBeNull();
      expect(cacheMetrics.error).toHaveBeenCalledWith('session', 'read');
    });
  });

  describe('set', () => {
    it('writes the session with the given TTL', async () => {
      const redis = { set: jest.fn().mockResolvedValue('OK') } as unknown as jest.Mocked<RedisService>;
      const service = new SessionCacheService(redis, makeCacheMetrics(), makeLogger());

      await service.set('sess_1', cachedSession, 300);

      expect(redis.set).toHaveBeenCalledWith(
        'sess:sess_1',
        JSON.stringify(cachedSession),
        'EX',
        300,
      );
    });

    it('skips the write entirely for a non-positive TTL', async () => {
      const redis = { set: jest.fn() } as unknown as jest.Mocked<RedisService>;
      const service = new SessionCacheService(redis, makeCacheMetrics(), makeLogger());

      await service.set('sess_1', cachedSession, 0);

      expect(redis.set).not.toHaveBeenCalled();
    });

    it('degrades silently when Redis is unreachable', async () => {
      const redis = {
        set: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      } as unknown as jest.Mocked<RedisService>;
      const cacheMetrics = makeCacheMetrics();
      const service = new SessionCacheService(redis, cacheMetrics, makeLogger());

      await expect(service.set('sess_1', cachedSession, 300)).resolves.toBeUndefined();
      expect(cacheMetrics.error).toHaveBeenCalledWith('session', 'write');
    });
  });

  describe('invalidate', () => {
    it('degrades silently when Redis is unreachable', async () => {
      const redis = {
        del: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      } as unknown as jest.Mocked<RedisService>;
      const cacheMetrics = makeCacheMetrics();
      const service = new SessionCacheService(redis, cacheMetrics, makeLogger());

      await expect(service.invalidate('sess_1')).resolves.toBeUndefined();
      expect(cacheMetrics.error).toHaveBeenCalledWith('session', 'invalidate');
    });
  });
});
