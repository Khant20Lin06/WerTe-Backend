import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from '../../modules/auth/entities/authenticated-request.entity';
import { AuthenticatedUserEntity } from '../../modules/auth/entities/authenticated-user.entity';

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUserEntity | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (user === undefined) {
      return undefined;
    }

    if (data === undefined) {
      return user;
    }

    return user[data];
  },
);
