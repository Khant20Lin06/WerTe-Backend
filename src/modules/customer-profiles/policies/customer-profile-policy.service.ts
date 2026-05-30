import { Injectable } from '@nestjs/common';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { UserRole } from '@prisma/client';
import { CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';

@Injectable()
export class CustomerProfilePolicyService {
  canAccessProfile(
    currentUser: AuthenticatedUserEntity,
    profile: CustomerProfileOwnershipRecord,
  ): boolean {
    return hasOwnedResourceAccess({
      currentUser,
      expectedRole: UserRole.CUSTOMER,
      ownerUserId: profile.user.id,
      resourceId: profile.id,
      actorScopedResourceId: currentUser.actorContext.customerProfileId,
    });
  }
}
