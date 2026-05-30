import { HttpStatus } from '@nestjs/common';
import { RiderStatus, UserRole, UserStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { RiderOwnershipRecord } from '../../../../src/modules/riders/entities/rider-ownership.entity';
import { RiderPolicyService } from '../../../../src/modules/riders/policies/rider-policy.service';
import { RidersRepository } from '../../../../src/modules/riders/repositories/riders.repository';
import { RiderAccountService } from '../../../../src/modules/riders/services/rider-account.service';
import { RidersService } from '../../../../src/modules/riders/services/riders.service';

describe('RiderAccountService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_rider_1',
    sessionId: 'session_1',
    role: UserRole.RIDER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_rider_1',
      phone: '0977777777',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
      riderId: 'rider_1',
    },
  };

  const makeRider = (
    overrides?: Partial<RiderOwnershipRecord>,
  ): RiderOwnershipRecord => ({
    id: 'rider_1',
    userId: 'usr_rider_1',
    displayName: 'Ko Aung',
    vehicleType: 'bike',
    currentTownship: 'Kamaryut',
    status: RiderStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_rider_1',
      phone: '0977777777',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
    },
    availability: {
      isOnline: true,
      isAvailable: true,
      lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
      updatedAt: new Date('2026-04-19T00:05:00.000Z'),
    },
    ...overrides,
  });

  it('returns the authenticated rider profile', async () => {
    const ridersService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(makeRider()),
    } as unknown as RidersService;
    const service = new RiderAccountService(
      ridersService,
      {} as RidersRepository,
      new RiderPolicyService(),
    );

    await expect(service.getCurrentRiderProfile(currentUser)).resolves.toEqual({
      id: 'rider_1',
      phone: '0977777777',
      displayName: 'Ko Aung',
      vehicleType: 'bike',
      currentTownship: 'Kamaryut',
      status: RiderStatus.ACTIVE,
      accountStatus: UserStatus.ACTIVE,
      createdAt: '2026-04-19T00:00:00.000Z',
      updatedAt: '2026-04-19T00:00:00.000Z',
    });
  });

  it('returns a lightweight operational summary for later dispatch flows', async () => {
    const ridersService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(makeRider()),
    } as unknown as RidersService;
    const service = new RiderAccountService(
      ridersService,
      {} as RidersRepository,
      new RiderPolicyService(),
    );

    await expect(service.getOperationalSummary(currentUser)).resolves.toEqual({
      riderId: 'rider_1',
      status: RiderStatus.ACTIVE,
      accountStatus: UserStatus.ACTIVE,
      vehicleType: 'bike',
      currentTownship: 'Kamaryut',
      isDispatchEligible: true,
      isOnline: true,
      isAvailable: true,
      lastStatusChangedAt: '2026-04-19T00:05:00.000Z',
      updatedAt: '2026-04-19T00:05:00.000Z',
    });
  });

  it('rejects when the authenticated rider has no owned rider profile', async () => {
    const ridersService = {
      findOwnedByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as RidersService;
    const service = new RiderAccountService(
      ridersService,
      {} as RidersRepository,
      new RiderPolicyService(),
    );

    await expect(service.getCurrentRiderProfile(currentUser)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
      response: expect.objectContaining({
        code: ErrorCodes.notFound,
      }),
    });
  });
});
