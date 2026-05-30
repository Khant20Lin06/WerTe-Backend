import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import {
  hasAnyRole,
  hasRole,
} from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';

@Injectable()
export class StoreTypePolicyService {
  canManageStoreTypes(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.ADMIN);
  }

  canBrowseStoreTypes(currentUser: AuthenticatedUserEntity): boolean {
    return hasAnyRole(currentUser, [UserRole.ADMIN, UserRole.MERCHANT]);
  }

  canRequestStoreTypes(currentUser: AuthenticatedUserEntity): boolean {
    return hasRole(currentUser, UserRole.MERCHANT);
  }
}
