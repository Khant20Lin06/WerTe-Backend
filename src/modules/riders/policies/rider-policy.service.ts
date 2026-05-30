import { Injectable } from '@nestjs/common';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
import { UserRole } from '@prisma/client';

@Injectable()
export class RiderPolicyService {
  canAccessRider(
    currentUser: AuthenticatedUserEntity,
    rider: RiderOwnershipRecord,
  ): boolean {
    return hasOwnedResourceAccess({
      currentUser,
      expectedRole: UserRole.RIDER,
      ownerUserId: rider.user.id,
      resourceId: rider.id,
      actorScopedResourceId: currentUser.actorContext.riderId,
    });
  }
}
