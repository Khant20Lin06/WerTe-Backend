import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { CacheMetricsService } from '../../../infrastructure/metrics/cache-metrics.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { safeRedisOp } from '../../../infrastructure/redis/safe-redis-op';
import { buildActorContext, UserIdentityRecord } from '../../users/entities/actor-context.entity';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthTokenPayloadEntity } from '../entities/auth-token-payload.entity';

type CachedSession = {
  userId: string;
  revokedAt: string | null;
  expiresAt: string;
  user: UserIdentityRecord;
};

const SESSION_KEY_PREFIX = 'sess:';
const CACHE_NAME = 'session';

@Injectable()
export class SessionCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Returns `null` on a real cache miss *or* when Redis is unreachable.
   * Callers (JwtStrategy.validate) already treat a `null` result as "go
   * verify against Postgres" — so a Redis outage degrades every request to a
   * DB-backed auth check instead of rejecting all authenticated traffic.
   */
  async get(sessionId: string): Promise<CachedSession | null> {
    return safeRedisOp('read', CACHE_NAME, this.logger, this.cacheMetrics, null, async () => {
      const raw = await this.redis.get(this.key(sessionId));
      if (raw === null) return null;
      return JSON.parse(raw) as CachedSession;
    });
  }

  async set(
    sessionId: string,
    data: CachedSession,
    ttlSeconds: number,
  ): Promise<void> {
    if (ttlSeconds <= 0) return;
    await safeRedisOp('write', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.set(this.key(sessionId), JSON.stringify(data), 'EX', ttlSeconds),
    );
  }

  async invalidate(sessionId: string): Promise<void> {
    await safeRedisOp('invalidate', CACHE_NAME, this.logger, this.cacheMetrics, undefined, () =>
      this.redis.del(this.key(sessionId)),
    );
  }

  buildAuthenticatedUser(
    payload: AuthTokenPayloadEntity,
    cached: CachedSession,
  ): AuthenticatedUserEntity {
    return {
      userId: cached.user.id,
      sessionId: payload.sessionId,
      role: cached.user.role,
      tokenType: payload.type,
      actorContext: buildActorContext(cached.user),
    };
  }

  private key(sessionId: string): string {
    return `${SESSION_KEY_PREFIX}${sessionId}`;
  }
}
