import { UserRole } from '@prisma/client';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';

type MerchantCatalogAccessInput = {
  currentUser: AuthenticatedUserEntity;
  ownerUserId: string;
  merchantId: string;
};

export function hasMerchantCatalogAccess({
  currentUser,
  ownerUserId,
  merchantId,
}: MerchantCatalogAccessInput): boolean {
  return hasOwnedResourceAccess({
    currentUser,
    expectedRole: UserRole.MERCHANT,
    ownerUserId,
    resourceId: merchantId,
    actorScopedResourceId: currentUser.actorContext.merchantId,
  });
}
