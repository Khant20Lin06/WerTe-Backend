import { UserRole, UserStatus } from '@prisma/client';

import { hasCheckoutCustomerAccess } from '../../../../src/modules/checkout/policies/checkout-customer-access-policy.helper';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('checkout customer access policy helper', () => {
  it('allows checkout access when customer user and scoped profile match', () => {
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
      hasCheckoutCustomerAccess({
        currentUser,
        ownerUserId: 'usr_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(true);
  });

  it('denies checkout access when the actor-scoped customer profile mismatches', () => {
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
      hasCheckoutCustomerAccess({
        currentUser,
        ownerUserId: 'usr_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(false);
  });

  it('denies checkout access for non-customer actors', () => {
    const currentUser = makeAuthenticatedUser({
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0999999999',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(
      hasCheckoutCustomerAccess({
        currentUser,
        ownerUserId: 'usr_admin_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(false);
  });

  it('allows checkout access when the actor has no scoped customer profile but still owns the resource', () => {
    const currentUser = makeAuthenticatedUser({
      role: UserRole.CUSTOMER,
      actorContext: {
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });

    expect(
      hasCheckoutCustomerAccess({
        currentUser,
        ownerUserId: 'usr_1',
        customerProfileId: 'cust_prof_1',
      }),
    ).toBe(true);
  });
});
