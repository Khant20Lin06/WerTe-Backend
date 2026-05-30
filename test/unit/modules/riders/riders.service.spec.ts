import { RiderStatus, UserRole, UserStatus } from '@prisma/client';

import { RiderOwnershipRecord } from '../../../../src/modules/riders/entities/rider-ownership.entity';
import { RidersRepository } from '../../../../src/modules/riders/repositories/riders.repository';
import { RidersService } from '../../../../src/modules/riders/services/riders.service';

describe('RidersService', () => {
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
    availability: null,
    ...overrides,
  });

  it('builds rider ownership details from the rider aggregate', () => {
    const repository = {} as RidersRepository;
    const service = new RidersService(repository);

    const ownership = service.buildOwnership(makeRider());

    expect(ownership).toEqual({
      riderId: 'rider_1',
      userId: 'usr_rider_1',
      phone: '0977777777',
      role: UserRole.RIDER,
      userStatus: UserStatus.ACTIVE,
      displayName: 'Ko Aung',
      vehicleType: 'bike',
      currentTownship: 'Kamaryut',
      status: RiderStatus.ACTIVE,
      availability: null,
    });
  });

  it('returns null when the rider does not belong to the authenticated user', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(makeRider()),
    } as unknown as RidersRepository;
    const service = new RidersService(repository);

    const rider = await service.findOwnedByUserId('usr_rider_2', 'rider_1');

    expect(rider).toBeNull();
  });
});
