import { UserRole } from '@prisma/client';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';

type CheckoutCustomerAccessInput = {
  currentUser: AuthenticatedUserEntity;
  ownerUserId: string;
  customerProfileId: string;
};

export function hasCheckoutCustomerAccess({
  currentUser,
  ownerUserId,
  customerProfileId,
}: CheckoutCustomerAccessInput): boolean {
  return hasOwnedResourceAccess({
    currentUser,
    expectedRole: UserRole.CUSTOMER,
    ownerUserId,
    resourceId: customerProfileId,
    actorScopedResourceId: currentUser.actorContext.customerProfileId,
  });
}
