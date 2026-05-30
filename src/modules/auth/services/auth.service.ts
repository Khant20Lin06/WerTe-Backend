import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { UserIdentityRecord } from '../../users/entities/actor-context.entity';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';
import { AuthenticatedUserEntity } from '../entities/authenticated-user.entity';
import {
  AuthTokenPayloadEntity,
  AuthTokenType,
} from '../entities/auth-token-payload.entity';
import { AuthRepository } from '../repositories/auth.repository';
import { PasswordService } from './password.service';

export type SessionRequestMetadata = {
  deviceId?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type JwtExpiresIn = NonNullable<Parameters<JwtService['signAsync']>[1]>['expiresIn'];

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async login(payload: LoginDto, metadata: SessionRequestMetadata = {}) {
    const user = await this.usersService.findByPhone(payload.phone);
    if (user === null) {
      throw this.invalidCredentialsException();
    }

    const passwordMatches = await this.passwordService.compare(
      payload.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw this.invalidCredentialsException();
    }

    if (this.usersService.isSuspended(user)) {
      throw new AppException('This account is suspended.', HttpStatus.FORBIDDEN, {
        code: ErrorCodes.accountSuspended,
      });
    }

    if (this.usersService.isPending(user)) {
      throw new AppException(
        'This account is pending activation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.accountPending,
        },
      );
    }

    const tokens = await this.issueSession(user, metadata);
    await this.authRepository.touchLastLogin(user.id);

    const actorContext = this.usersService.buildActorContext(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: tokens.sessionId,
      userId: user.id,
      actorContext,
    };
  }

  async refreshSession(
    refreshToken: string,
    metadata: SessionRequestMetadata = {},
  ) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.authRepository.findSessionById(payload.sessionId);

    if (session === null || session.userId !== payload.sub) {
      throw this.invalidTokenException();
    }

    this.assertSessionIsActive(session);

    const tokenMatches = await this.passwordService.compare(
      refreshToken,
      session.refreshTokenHash,
    );
    if (!tokenMatches) {
      throw this.invalidTokenException();
    }

    const user = session.user;

    if (this.usersService.isSuspended(user)) {
      throw new AppException('This account is suspended.', HttpStatus.FORBIDDEN, {
        code: ErrorCodes.accountSuspended,
      });
    }

    if (this.usersService.isPending(user)) {
      throw new AppException(
        'This account is pending activation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.accountPending,
        },
      );
    }

    const tokens = await this.rotateSession(user, session.id, metadata);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: tokens.sessionId,
      userId: user.id,
      actorContext: this.usersService.buildActorContext(user),
    };
  }

  async revokeSession(sessionId: string) {
    await this.authRepository.revokeSession(sessionId);
  }

  async logout(
    currentUser: AuthenticatedUserEntity,
    payload: {
      sessionId?: string;
      refreshToken?: string;
    } = {},
  ) {
    const targetSessionId = await this.resolveTargetSessionId(currentUser, payload);
    const targetSession = await this.authRepository.findSessionById(targetSessionId);

    if (targetSession !== null && targetSession.userId !== currentUser.userId) {
      throw new AppException(
        'You are not allowed to revoke this session.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    await this.authRepository.revokeSession(targetSessionId);

    return {
      revokedSessionId: targetSessionId,
    };
  }

  getCurrentSession(currentUser: AuthenticatedUserEntity) {
    return {
      userId: currentUser.userId,
      sessionId: currentUser.sessionId,
      role: currentUser.role,
      actorContext: currentUser.actorContext,
    };
  }

  registerPushToken(
    currentUser: AuthenticatedUserEntity,
    payload: RegisterPushTokenDto,
  ) {
    return this.authRepository.registerPushToken({
      userId: currentUser.userId,
      deviceId: payload.deviceId,
      platform: payload.platform,
      token: payload.token,
    });
  }

  async unregisterPushToken(
    currentUser: AuthenticatedUserEntity,
    deviceId: string,
  ) {
    await this.authRepository.unregisterPushToken(currentUser.userId, deviceId);

    return {
      deviceId,
    };
  }

  private invalidCredentialsException() {
    return new AppException(
      'Invalid phone number or password.',
      HttpStatus.UNAUTHORIZED,
      {
        code: ErrorCodes.invalidCredentials,
      },
    );
  }

  private invalidTokenException() {
    return new AppException('Invalid refresh token.', HttpStatus.UNAUTHORIZED, {
      code: ErrorCodes.invalidToken,
    });
  }

  private revokedSessionException() {
    return new AppException('This session has been revoked.', HttpStatus.UNAUTHORIZED, {
      code: ErrorCodes.sessionRevoked,
    });
  }

  private expiredSessionException() {
    return new AppException('This session has expired.', HttpStatus.UNAUTHORIZED, {
      code: ErrorCodes.sessionExpired,
    });
  }

  private async issueSession(
    user: UserIdentityRecord,
    metadata: SessionRequestMetadata,
  ) {
    const sessionId = randomUUID();
    const accessToken = await this.signToken(user, sessionId, 'access');
    const refreshToken = await this.signToken(user, sessionId, 'refresh');
    const refreshTokenHash = await this.passwordService.hash(refreshToken);
    const refreshTokenExpiresAt = this.extractExpiryDate(refreshToken);

    await this.authRepository.createSession({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
      deviceId: metadata.deviceId,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  }

  private async rotateSession(
    user: UserIdentityRecord,
    sessionId: string,
    metadata: SessionRequestMetadata,
  ) {
    const accessToken = await this.signToken(user, sessionId, 'access');
    const refreshToken = await this.signToken(user, sessionId, 'refresh');
    const refreshTokenHash = await this.passwordService.hash(refreshToken);
    const refreshTokenExpiresAt = this.extractExpiryDate(refreshToken);

    await this.authRepository.rotateSession(
      sessionId,
      refreshTokenHash,
      refreshTokenExpiresAt,
      metadata,
    );

    return {
      accessToken,
      refreshToken,
      sessionId,
    };
  }

  private async signToken(
    user: UserIdentityRecord,
    sessionId: string,
    type: AuthTokenType,
  ): Promise<string> {
    const expiresIn =
      (
        type === 'access'
          ? this.configService.getOrThrow<string>('jwt.accessExpiresIn')
          : this.configService.getOrThrow<string>('jwt.refreshExpiresIn')
      ) as JwtExpiresIn;

    return this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        sessionId,
        type,
      } satisfies AuthTokenPayloadEntity,
      {
        secret:
          type === 'access'
            ? this.configService.getOrThrow<string>('jwt.accessSecret')
            : this.configService.getOrThrow<string>('jwt.refreshSecret'),
        issuer: this.configService.getOrThrow<string>('jwt.issuer'),
        audience: this.configService.getOrThrow<string>('jwt.audience'),
        expiresIn,
      },
    );
  }

  private extractExpiryDate(token: string): Date {
    const decodedToken = this.jwtService.decode(token);
    const tokenPayload =
      decodedToken !== null && typeof decodedToken === 'object'
        ? (decodedToken as { exp?: unknown })
        : null;

    if (tokenPayload === null || typeof tokenPayload.exp !== 'number') {
      throw new AppException(
        'Unable to resolve token expiry.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
        },
      );
    }

    return new Date(tokenPayload.exp * 1000);
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<AuthTokenPayloadEntity> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthTokenPayloadEntity>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
          issuer: this.configService.getOrThrow<string>('jwt.issuer'),
          audience: this.configService.getOrThrow<string>('jwt.audience'),
        },
      );

      if (payload.type !== 'refresh') {
        throw this.invalidTokenException();
      }

      return payload;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      throw this.invalidTokenException();
    }
  }

  private assertSessionIsActive(session: {
    revokedAt: Date | null;
    expiresAt: Date;
  }) {
    if (session.revokedAt !== null) {
      throw this.revokedSessionException();
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw this.expiredSessionException();
    }
  }

  private async resolveTargetSessionId(
    currentUser: AuthenticatedUserEntity,
    payload: {
      sessionId?: string;
      refreshToken?: string;
    },
  ) {
    if (payload.refreshToken !== undefined) {
      const refreshPayload = await this.verifyRefreshToken(payload.refreshToken);

      if (refreshPayload.sub !== currentUser.userId) {
        throw new AppException(
          'You are not allowed to revoke this session.',
          HttpStatus.FORBIDDEN,
          {
            code: ErrorCodes.forbidden,
          },
        );
      }

      return refreshPayload.sessionId;
    }

    if (payload.sessionId !== undefined) {
      return payload.sessionId;
    }

    return currentUser.sessionId;
  }
}
