import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { UsersService } from '../../users/services/users.service';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import { AuthTokenPayloadEntity } from '../entities/auth-token-payload.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { SessionCacheService } from '../services/session-cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly sessionCache: SessionCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
      issuer: configService.getOrThrow<string>('jwt.issuer'),
      audience: configService.getOrThrow<string>('jwt.audience'),
    });
  }

  async validate(
    payload: AuthTokenPayloadEntity,
  ): Promise<AuthenticatedUserEntity> {
    if (payload.type !== 'access') {
      throw new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.invalidToken,
      });
    }

    const cached = await this.sessionCache.get(payload.sessionId);
    if (cached !== null) {
      return this.validateCached(payload, cached);
    }

    return this.validateFromDb(payload);
  }

  private validateCached(
    payload: AuthTokenPayloadEntity,
    cached: ReturnType<SessionCacheService['get']> extends Promise<infer T>
      ? NonNullable<T>
      : never,
  ): AuthenticatedUserEntity {
    if (cached.userId !== payload.sub) {
      throw new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.invalidToken,
      });
    }

    if (cached.revokedAt !== null) {
      throw new AppException('This session has been revoked.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.sessionRevoked,
      });
    }

    if (new Date(cached.expiresAt).getTime() <= Date.now()) {
      throw new AppException('This session has expired.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.sessionExpired,
      });
    }

    if (this.usersService.isSuspended(cached.user)) {
      throw new AppException('This account is suspended.', HttpStatus.FORBIDDEN, {
        code: ErrorCodes.accountSuspended,
      });
    }

    if (this.usersService.isPending(cached.user)) {
      throw new AppException(
        'This account is pending activation.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.accountPending },
      );
    }

    return this.sessionCache.buildAuthenticatedUser(payload, cached);
  }

  private async validateFromDb(
    payload: AuthTokenPayloadEntity,
  ): Promise<AuthenticatedUserEntity> {
    const session = await this.authRepository.findSessionById(payload.sessionId);

    if (session === null || session.userId !== payload.sub) {
      throw new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.invalidToken,
      });
    }

    if (session.revokedAt !== null) {
      throw new AppException('This session has been revoked.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.sessionRevoked,
      });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new AppException('This session has expired.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.sessionExpired,
      });
    }

    if (this.usersService.isSuspended(session.user)) {
      throw new AppException('This account is suspended.', HttpStatus.FORBIDDEN, {
        code: ErrorCodes.accountSuspended,
      });
    }

    if (this.usersService.isPending(session.user)) {
      throw new AppException(
        'This account is pending activation.',
        HttpStatus.FORBIDDEN,
        { code: ErrorCodes.accountPending },
      );
    }

    // Cap cache TTL at 5 minutes regardless of token lifetime.
    // Shorter TTL bounds the window in which a revoked session remains cached
    // after sign-out (sign-out already invalidates the key, but a race between
    // two concurrent requests could re-populate it for up to this duration).
    const MAX_CACHE_TTL_SECONDS = 300; // 5 min
    const tokenTtlSeconds = payload.exp !== undefined
      ? payload.exp - Math.floor(Date.now() / 1_000)
      : MAX_CACHE_TTL_SECONDS;
    const ttlSeconds = Math.min(tokenTtlSeconds, MAX_CACHE_TTL_SECONDS);

    await this.sessionCache.set(payload.sessionId, {
      userId: session.userId,
      revokedAt: null, // session.revokedAt is null here — revoked sessions are rejected above
      expiresAt: session.expiresAt.toISOString(),
      user: session.user,
    }, ttlSeconds);

    return {
      userId: session.user.id,
      sessionId: session.id,
      role: session.user.role,
      tokenType: payload.type,
      actorContext: this.usersService.buildActorContext(session.user),
    };
  }
}
