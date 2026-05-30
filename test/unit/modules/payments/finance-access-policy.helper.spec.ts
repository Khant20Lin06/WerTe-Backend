import { HttpStatus } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

import {
  hasAdminFinanceAccess,
  hasCustomerFinanceScope,
  requireAdminFinanceAccess,
  requireCustomerFinanceScope,
} from '../../../../src/modules/payments/policies/finance-access-policy.helper';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('FinanceAccessPolicyHelper', () => {
  it('detects customer finance scope when a customer profile is present', () => {
    const currentUser = makeAuthenticatedUser({
      actorContext: {
        userId: 'usr_customer_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    });

    expect(hasCustomerFinanceScope(currentUser)).toBe(true);
    expect(requireCustomerFinanceScope(currentUser)).toBe('cust_prof_1');
  });

  it('rejects finance customer scope access when the actor is not a scoped customer', () => {
    const adminUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '099999999',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(hasCustomerFinanceScope(adminUser)).toBe(false);
    expect(() => requireCustomerFinanceScope(adminUser)).toThrow(
      expect.objectContaining({
        status: HttpStatus.FORBIDDEN,
      }),
    );
  });

  it('detects admin finance access and rejects non-admin actors', () => {
    const adminUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '099999999',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(hasAdminFinanceAccess(adminUser)).toBe(true);
    expect(() => requireAdminFinanceAccess(adminUser, 'payments')).not.toThrow();

    expect(hasAdminFinanceAccess(makeAuthenticatedUser())).toBe(false);
    expect(() =>
      requireAdminFinanceAccess(makeAuthenticatedUser(), 'refunds'),
    ).toThrow(
      expect.objectContaining({
        status: HttpStatus.FORBIDDEN,
      }),
    );
  });
});
