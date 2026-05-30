import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isObservable, lastValueFrom } from 'rxjs';

import { ErrorCodes } from '../constants/error-codes';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const activationResult = super.canActivate(context);

    if (isObservable(activationResult)) {
      return lastValueFrom(activationResult);
    }

    return await Promise.resolve(activationResult);
  }

  handleRequest<TUser>(
    error: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    if (error !== null && error !== undefined) {
      throw error;
    }

    if (user === false || user === null || user === undefined) {
      throw new AppException('Authentication required.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.unauthorized,
      });
    }

    return user;
  }
}
