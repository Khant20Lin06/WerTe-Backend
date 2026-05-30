import { UserRole, UserStatus } from '@prisma/client';

import { ZonePolicyService } from '../../../../src/modules/zones/policies/zone-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('ZonePolicyService', () => {
  const service = new ZonePolicyService();

  it('allows admins to manage zones', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '09111111111',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(service.canManageZones(currentUser)).toBe(true);
  });

  it('allows merchants to read active zones', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0999999999',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });

    expect(service.canReadActiveZones(currentUser)).toBe(true);
  });

  it('denies customers from reading active zone management data', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_customer_1',
      role: UserRole.CUSTOMER,
      actorContext: {
        userId: 'usr_customer_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    });

    expect(service.canReadActiveZones(currentUser)).toBe(false);
  });
});
