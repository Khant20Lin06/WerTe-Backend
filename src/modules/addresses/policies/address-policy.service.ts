import { Injectable } from '@nestjs/common';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AddressOwnershipRecord } from '../entities/address-ownership.entity';
import { CustomerProfileOwnershipRecord } from '../../customer-profiles/entities/customer-profile-ownership.entity';
import { UserRole } from '@prisma/client';

@Injectable()
export class AddressPolicyService {
  canListAddresses(
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

  canManageAddress(
    currentUser: AuthenticatedUserEntity,
    address: AddressOwnershipRecord,
  ): boolean {
    return hasOwnedResourceAccess({
      currentUser,
      expectedRole: UserRole.CUSTOMER,
      ownerUserId: address.customerProfile.user.id,
      resourceId: address.customerProfile.id,
      actorScopedResourceId: currentUser.actorContext.customerProfileId,
    });
  }
}
