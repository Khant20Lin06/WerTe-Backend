import { Injectable } from '@nestjs/common';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
import { UserRole } from '@prisma/client';

@Injectable()
export class MerchantPolicyService {
  canAccessMerchant(
    currentUser: AuthenticatedUserEntity,
    merchant: MerchantOwnershipRecord,
  ): boolean {
    return hasOwnedResourceAccess({
      currentUser,
      expectedRole: UserRole.MERCHANT,
      ownerUserId: merchant.user.id,
      resourceId: merchant.id,
      actorScopedResourceId: currentUser.actorContext.merchantId,
    });
  }
}
