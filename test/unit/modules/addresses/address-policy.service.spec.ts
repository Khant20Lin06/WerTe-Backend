import { Prisma, UserRole, UserStatus } from '@prisma/client';

import { AddressOwnershipRecord } from '../../../../src/modules/addresses/entities/address-ownership.entity';
import { AddressPolicyService } from '../../../../src/modules/addresses/policies/address-policy.service';
import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AddressPolicyService', () => {
  const service = new AddressPolicyService();

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

  const address: AddressOwnershipRecord = {
    id: 'addr_1',
    customerProfileId: 'cust_prof_1',
    label: 'Home',
    line1: 'No. 1, Main Road',
    line2: null,
    landmark: null,
    township: 'Thingangyun',
    city: 'Yangon',
    postalCode: null,
    deliveryInstructions: null,
    isDefault: true,
    latitude: new Prisma.Decimal('16.834'),
    longitude: new Prisma.Decimal('96.176'),
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    customerProfile: {
      id: 'cust_prof_1',
      userId: 'usr_1',
      user: {
        id: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    },
  };

  it('allows the owning customer to list addresses', () => {
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

    expect(service.canListAddresses(currentUser, profile)).toBe(true);
  });

  it('denies managing addresses outside the actor scope', () => {
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

    expect(service.canManageAddress(currentUser, address)).toBe(false);
  });
});
