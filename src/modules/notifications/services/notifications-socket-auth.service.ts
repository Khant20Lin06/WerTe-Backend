import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AuthTokenPayloadEntity } from '../../auth/entities/auth-token-payload.entity';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class NotificationsSocketAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
  ) {}

  async authenticateClient(client: Socket): Promise<AuthenticatedUserEntity> {
    const accessToken = this.extractAccessToken(client);

    if (accessToken === null) {
      throw new AppException('Missing access token.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.invalidToken,
      });
    }

    const payload = await this.verifyAccessToken(accessToken);
    const session = await this.authRepository.findSessionById(payload.sessionId);

    if (session === null || session.userId !== payload.sub) {
      throw new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.invalidToken,
      });
    }

    if (session.revokedAt !== null) {
      throw new AppException(
        'This session has been revoked.',
        HttpStatus.UNAUTHORIZED,
        {
          code: ErrorCodes.sessionRevoked,
        },
      );
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
        {
          code: ErrorCodes.accountPending,
        },
      );
    }

    return {
      userId: session.user.id,
      sessionId: session.id,
      role: session.user.role,
      tokenType: payload.type,
      actorContext: this.usersService.buildActorContext(session.user),
    };
  }

  private extractAccessToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken.startsWith('Bearer ')
        ? authToken.slice(7).trim()
        : authToken.trim();
    }

    const headerValue = client.handshake.headers.authorization;
    if (typeof headerValue === 'string' && headerValue.startsWith('Bearer ')) {
      return headerValue.slice(7).trim();
    }

    return null;
  }

  private async verifyAccessToken(
    accessToken: string,
  ): Promise<AuthTokenPayloadEntity> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthTokenPayloadEntity>(
        accessToken,
        {
          secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
          issuer: this.configService.getOrThrow<string>('jwt.issuer'),
          audience: this.configService.getOrThrow<string>('jwt.audience'),
        },
      );

      if (payload.type !== 'access') {
        throw new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED, {
          code: ErrorCodes.invalidToken,
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException('Invalid access token.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.invalidToken,
      });
    }
  }
}
