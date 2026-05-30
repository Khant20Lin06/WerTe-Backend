import { Injectable } from '@nestjs/common';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../../merchants/entities/merchant-ownership.entity';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';
import { UserRole } from '@prisma/client';

@Injectable()
export class BranchPolicyService {
  canManageMerchant(
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

  canManageBranch(
    currentUser: AuthenticatedUserEntity,
    branch: BranchOwnershipRecord,
  ): boolean {
    return hasOwnedResourceAccess({
      currentUser,
      expectedRole: UserRole.MERCHANT,
      ownerUserId: branch.merchant.user.id,
      resourceId: branch.merchant.id,
      actorScopedResourceId: currentUser.actorContext.merchantId,
    });
  }
}
