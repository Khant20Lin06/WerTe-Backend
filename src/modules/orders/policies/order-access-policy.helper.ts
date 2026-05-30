import { UserRole } from '@prisma/client';

import { hasOwnedResourceAccess } from '../../../common/policies/tenant-access-policy.helper';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { OrderSummaryEntity } from '../entities/order-summary.entity';

type OrderAccessInput = {
  currentUser: AuthenticatedUserEntity;
  order: OrderSummaryEntity;
};

export function hasCustomerOrderAccess({
  currentUser,
  order,
}: OrderAccessInput): boolean {
  return hasOwnedResourceAccess({
    currentUser,
    expectedRole: UserRole.CUSTOMER,
    ownerUserId: order.customer.userId,
    resourceId: order.customer.customerProfileId,
    actorScopedResourceId: currentUser.actorContext.customerProfileId,
  });
}

export function hasMerchantOrderAccess({
  currentUser,
  order,
}: OrderAccessInput): boolean {
  return hasOwnedResourceAccess({
    currentUser,
    expectedRole: UserRole.MERCHANT,
    ownerUserId: order.branch.merchantUserId,
    resourceId: order.branch.merchantId,
    actorScopedResourceId: currentUser.actorContext.merchantId,
  });
}

export function hasRiderOrderAccess({
  currentUser,
  order,
}: OrderAccessInput): boolean {
  const rider = order.delivery?.rider;

  if (rider === null || rider === undefined) {
    return false;
  }

  return hasOwnedResourceAccess({
    currentUser,
    expectedRole: UserRole.RIDER,
    ownerUserId: rider.userId,
    resourceId: rider.riderId,
    actorScopedResourceId: currentUser.actorContext.riderId,
  });
}
