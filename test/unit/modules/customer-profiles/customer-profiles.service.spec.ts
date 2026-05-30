import { UserRole, UserStatus } from '@prisma/client';

import { CustomerProfilesRepository } from '../../../../src/modules/customer-profiles/repositories/customer-profiles.repository';
import { CustomerProfilesService } from '../../../../src/modules/customer-profiles/services/customer-profiles.service';
import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';

describe('CustomerProfilesService', () => {
  const makeProfile = (
    overrides?: Partial<CustomerProfileOwnershipRecord>,
  ): CustomerProfileOwnershipRecord => ({
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
    ...overrides,
  });

  it('builds an ownership summary from the customer profile aggregate', () => {
    const repository = {} as CustomerProfilesRepository;
    const service = new CustomerProfilesService(repository);

    const ownership = service.buildOwnership(makeProfile());

    expect(ownership).toEqual({
      customerProfileId: 'cust_prof_1',
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      userStatus: UserStatus.ACTIVE,
      fullName: 'Mg Mg',
      avatarUrl: null,
    });
  });

  it('returns null when the profile does not belong to the requesting user', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(makeProfile()),
    } as unknown as CustomerProfilesRepository;
    const service = new CustomerProfilesService(repository);

    const profile = await service.findOwnedByUserId('usr_2', 'cust_prof_1');

    expect(profile).toBeNull();
  });
});
