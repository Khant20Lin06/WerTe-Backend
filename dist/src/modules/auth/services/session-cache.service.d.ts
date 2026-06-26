import { RedisService } from '../../../infrastructure/redis/redis.service';
import { UserIdentityRecord } from '../../users/entities/actor-context.entity';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthTokenPayloadEntity } from '../entities/auth-token-payload.entity';
type CachedSession = {
    userId: string;
    revokedAt: string | null;
    expiresAt: string;
    user: UserIdentityRecord;
};
export declare class SessionCacheService {
    private readonly redis;
    constructor(redis: RedisService);
    get(sessionId: string): Promise<CachedSession | null>;
    set(sessionId: string, data: CachedSession, ttlSeconds: number): Promise<void>;
    invalidate(sessionId: string): Promise<void>;
    buildAuthenticatedUser(payload: AuthTokenPayloadEntity, cached: CachedSession): AuthenticatedUserEntity;
    private key;
}
export {};
