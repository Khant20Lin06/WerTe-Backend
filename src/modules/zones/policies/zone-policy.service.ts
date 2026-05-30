import { Injectable } from '@nestjs/common';

import {
  hasAnyRole,
  hasRole,
} from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { UserRole } from '@prisma/client';

@Injectable()
export class ZonePolicyService {
  canManageZones(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.ADMIN);
  }

  canReadActiveZones(currentUser: AuthenticatedUserEntity): boolean {
    return hasAnyRole(currentUser, [UserRole.ADMIN, UserRole.MERCHANT]);
  }
}
