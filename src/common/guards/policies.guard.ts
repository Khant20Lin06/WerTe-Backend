import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export const POLICIES_KEY = 'policies';

/**
 * Guard placeholder — ABAC/PBAC evaluation is not yet implemented.
 * Currently passes all authenticated requests so that @Policies decorators
 * can be added to controllers without breaking access. When policy
 * evaluation is implemented, replace the `return true` below with real
 * policy checks using the Reflector metadata.
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // TODO: Implement policy evaluation. Replace with real ABAC checks.
    return true;
  }
}
