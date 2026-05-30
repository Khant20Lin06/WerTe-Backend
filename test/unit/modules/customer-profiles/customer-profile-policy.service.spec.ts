import { UserRole, UserStatus } from '@prisma/client';

import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilePolicyService } from '../../../../src/modules/customer-profiles/policies/customer-profile-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('CustomerProfilePolicyService', () => {
  const service = new CustomerProfilePolicyService();

  const profile: CustomerProfileOwnershipRecord = {
    id: 'cust_prof_1',
    userId: 'usr_1',
    fullName: 'Mg Mg',
    avatarUrl: null,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  };

  it('allows the owning customer to access the profile', () => {
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

    expect(service.canAccessProfile(currentUser, profile)).toBe(true);
  });

  it('denies access when the actor is not the owning customer', () => {
    const currentUser = makeAuthenticatedUser({
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '09111111111',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(service.canAccessProfile(currentUser, profile)).toBe(false);
  });
});
