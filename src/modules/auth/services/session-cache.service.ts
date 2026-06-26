import { Injectable } from '@nestjs/common';

import { RedisService } from '../../../infrastructure/redis/redis.service';
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

@Injectable()
export class SessionCacheService {
  constructor(private readonly redis: RedisService) {}

  async get(sessionId: string): Promise<CachedSession | null> {
    const raw = await this.redis.get(this.key(sessionId));
    if (raw === null) return null;
    return JSON.parse(raw) as CachedSession;
  }

  async set(
    sessionId: string,
    data: CachedSession,
    ttlSeconds: number,
  ): Promise<void> {
    if (ttlSeconds <= 0) return;
    await this.redis.set(
      this.key(sessionId),
      JSON.stringify(data),
      'EX',
      ttlSeconds,
    );
  }

  async invalidate(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
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
