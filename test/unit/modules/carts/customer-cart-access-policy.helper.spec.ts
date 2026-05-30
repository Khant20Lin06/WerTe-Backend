import { UserRole, UserStatus } from '@prisma/client';

import { hasCustomerCartAccess } from '../../../../src/modules/carts/policies/customer-cart-access-policy.helper';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('customer cart access policy helper', () => {
  it('allows customer cart access when user and actor-scoped customer profile match', () => {
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
      hasCustomerCartAccess({
        currentUser,
        ownerUserId: 'usr_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(true);
  });

  it('denies customer cart access when the actor-scoped customer profile mismatches', () => {
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
      hasCustomerCartAccess({
        currentUser,
        ownerUserId: 'usr_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(false);
  });

  it('denies customer cart access for non-customer actors', () => {
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

    expect(
      hasCustomerCartAccess({
        currentUser,
        ownerUserId: 'usr_merchant_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(false);
  });
});
