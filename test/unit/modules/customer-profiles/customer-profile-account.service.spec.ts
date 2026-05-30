import { HttpStatus } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { CustomerProfileOwnershipRecord } from '../../../../src/modules/customer-profiles/entities/customer-profile-ownership.entity';
import { CustomerProfilePolicyService } from '../../../../src/modules/customer-profiles/policies/customer-profile-policy.service';
import { CustomerProfilesRepository } from '../../../../src/modules/customer-profiles/repositories/customer-profiles.repository';
import { CustomerProfileAccountService } from '../../../../src/modules/customer-profiles/services/customer-profile-account.service';
import { CustomerProfilesService } from '../../../../src/modules/customer-profiles/services/customer-profiles.service';

describe('CustomerProfileAccountService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  };

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

  it('returns the authenticated customer profile', async () => {
    const profilesService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(makeProfile()),
    } as unknown as CustomerProfilesService;
    const service = new CustomerProfileAccountService(
      profilesService,
      {} as CustomerProfilesRepository,
      new CustomerProfilePolicyService(),
    );

    await expect(service.getCurrentProfile(currentUser)).resolves.toEqual({
      id: 'cust_prof_1',
      phone: '09123456789',
      fullName: 'Mg Mg',
      avatarUrl: null,
      status: UserStatus.ACTIVE,
      createdAt: '2026-04-19T00:00:00.000Z',
      updatedAt: '2026-04-19T00:00:00.000Z',
    });
  });

  it('rejects when the authenticated customer has no owned profile', async () => {
    const profilesService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as CustomerProfilesService;
    const service = new CustomerProfileAccountService(
      profilesService,
      {} as CustomerProfilesRepository,
      new CustomerProfilePolicyService(),
    );

    await expect(service.getCurrentProfile(currentUser)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });
});
