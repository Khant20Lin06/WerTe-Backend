import { UserRole } from '@prisma/client';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';

type CustomerCartAccessInput = {
  currentUser: AuthenticatedUserEntity;
  ownerUserId: string;
  customerProfileId: string;
};

export function hasCustomerCartAccess({
  currentUser,
  ownerUserId,
  customerProfileId,
}: CustomerCartAccessInput): boolean {
  return hasOwnedResourceAccess({
    currentUser,
    expectedRole: UserRole.CUSTOMER,
    ownerUserId,
    resourceId: customerProfileId,
    actorScopedResourceId: currentUser.actorContext.customerProfileId,
  });
}
