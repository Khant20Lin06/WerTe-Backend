import { UserRole, UserStatus } from '@prisma/client';

import {
  hasAnyRole,
  hasOwnedResourceAccess,
  matchesActorScopedResource,
} from '../../../src/common/policies/tenant-access-policy.helper';
import { makeAuthenticatedUser } from '../helpers/authenticated-user.factory';

describe('tenant access policy helper', () => {
  it('allows owned resource access when role, owner, and scope all match', () => {
    const currentUser = makeAuthenticatedUser({
      role: UserRole.CUSTOMER,
      actorContext: {
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    });

    expect(
      hasOwnedResourceAccess({
        currentUser,
        expectedRole: UserRole.CUSTOMER,
        ownerUserId: 'usr_1',
        resourceId: 'cust_prof_1',
        actorScopedResourceId: currentUser.actorContext.customerProfileId,
      }),
    ).toBe(true);
  });

  it('denies owned resource access when the scoped resource mismatches', () => {
    const currentUser = makeAuthenticatedUser({
      role: UserRole.CUSTOMER,
      actorContext: {
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_2',
      },
    });

    expect(
      hasOwnedResourceAccess({
        currentUser,
        expectedRole: UserRole.CUSTOMER,
        ownerUserId: 'usr_1',
        resourceId: 'cust_prof_1',
        actorScopedResourceId: currentUser.actorContext.customerProfileId,
      }),
    ).toBe(false);
  });

  it('allows open scope when the actor-scoped resource id is undefined', () => {
    expect(matchesActorScopedResource(undefined, 'merchant_1')).toBe(true);
  });

  it('supports multi-role checks for shared read scenarios', () => {
    const currentUser = makeAuthenticatedUser({
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0999999999',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });

    expect(hasAnyRole(currentUser, [UserRole.ADMIN, UserRole.MERCHANT])).toBe(
      true,
    );
  });
});
