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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
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
}
