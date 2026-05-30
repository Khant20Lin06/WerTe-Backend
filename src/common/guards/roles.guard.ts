import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../../modules/auth/entities/authenticated-request.entity';
import { ErrorCodes } from '../constants/error-codes';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (user === undefined) {
      throw new AppException('Authentication required.', HttpStatus.UNAUTHORIZED, {
        code: ErrorCodes.unauthorized,
      });
    }

    return roles.includes(user.role);
  }
}
