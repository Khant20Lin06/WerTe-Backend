import { HttpStatus } from '@nestjs/common';
import { RiderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { RiderOwnershipRecord } from '../../../../src/modules/riders/entities/rider-ownership.entity';
import { RidersRepository } from '../../../../src/modules/riders/repositories/riders.repository';
import { RiderAccountService } from '../../../../src/modules/riders/services/rider-account.service';
import { RiderAvailabilityService } from '../../../../src/modules/riders/services/rider-availability.service';

describe('RiderAvailabilityService', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_rider_1',
    role: UserRole.RIDER,
    actorContext: {
      userId: 'usr_rider_1',
      phone: '0977777777',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
      riderId: 'rider_1',
    },
  });

  const makeRider = (
    overrides?: Partial<RiderOwnershipRecord>,
  ): RiderOwnershipRecord => ({
    id: 'rider_1',
    userId: 'usr_rider_1',
    displayName: 'Ko Aung',
    vehicleType: 'bike',
    plateNumber: null,
    currentTownship: 'Kamaryut',
    weeklySchedule: null,
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

  const makeService = () => {
    const riderAccountService = {
      resolveOwnedRider: jest.fn(),
    } as unknown as jest.Mocked<RiderAccountService>;
    const ridersRepository = {
      upsertAvailability: jest.fn(),
    } as unknown as jest.Mocked<RidersRepository>;
    const queueService = { add: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<QueueService>;
    const service = new RiderAvailabilityService(
      riderAccountService,
      ridersRepository,
      queueService,
    );

    return { riderAccountService, ridersRepository, service };
  };

  it('returns the current availability snapshot for the authenticated rider', async () => {
    const { riderAccountService, service } = makeService();
    riderAccountService.resolveOwnedRider.mockResolvedValue(
      makeRider({
        availability: {
          isOnline: true,
          isAvailable: true,
          lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
          updatedAt: new Date('2026-04-19T00:05:00.000Z'),
        },
      }),
    );

    await expect(service.getCurrentAvailability(currentUser)).resolves.toEqual({
      riderId: 'rider_1',
      status: RiderStatus.ACTIVE,
      accountStatus: UserStatus.ACTIVE,
      currentTownship: 'Kamaryut',
      isOnline: true,
      isAvailable: true,
      isDispatchEligible: true,
      lastStatusChangedAt: '2026-04-19T00:05:00.000Z',
      updatedAt: '2026-04-19T00:05:00.000Z',
    });
  });

  it('marks an active rider online and available', async () => {
    const { riderAccountService, ridersRepository, service } = makeService();
    riderAccountService.resolveOwnedRider.mockResolvedValue(makeRider());
    ridersRepository.upsertAvailability.mockResolvedValue(
      makeRider({
        availability: {
          isOnline: true,
          isAvailable: true,
          lastStatusChangedAt: new Date('2026-04-19T00:06:00.000Z'),
          updatedAt: new Date('2026-04-19T00:06:00.000Z'),
        },
      }),
    );

    const result = await service.markCurrentRiderOnline(currentUser);

    expect(ridersRepository.upsertAvailability).toHaveBeenCalledWith(
      'rider_1',
      expect.objectContaining({
        isOnline: true,
        isAvailable: true,
      }),
    );
    expect(result.isOnline).toBe(true);
    expect(result.isAvailable).toBe(true);
    expect(result.isDispatchEligible).toBe(true);
  });

  it('returns the current rider availability when already online and available', async () => {
    const { riderAccountService, ridersRepository, service } = makeService();
    riderAccountService.resolveOwnedRider.mockResolvedValue(
      makeRider({
        availability: {
          isOnline: true,
          isAvailable: true,
          lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
          updatedAt: new Date('2026-04-19T00:05:00.000Z'),
        },
      }),
    );

    const result = await service.markCurrentRiderOnline(currentUser);

    expect(ridersRepository.upsertAvailability).not.toHaveBeenCalled();
    expect(result.isOnline).toBe(true);
    expect(result.isAvailable).toBe(true);
  });

  it('marks the rider offline and unavailable', async () => {
    const { riderAccountService, ridersRepository, service } = makeService();
    riderAccountService.resolveOwnedRider.mockResolvedValue(
      makeRider({
        availability: {
          isOnline: true,
          isAvailable: true,
          lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
          updatedAt: new Date('2026-04-19T00:05:00.000Z'),
        },
      }),
    );
    ridersRepository.upsertAvailability.mockResolvedValue(
      makeRider({
        availability: {
          isOnline: false,
          isAvailable: false,
          lastStatusChangedAt: new Date('2026-04-19T00:07:00.000Z'),
          updatedAt: new Date('2026-04-19T00:07:00.000Z'),
        },
      }),
    );

    const result = await service.markCurrentRiderOffline(currentUser);

    expect(ridersRepository.upsertAvailability).toHaveBeenCalledWith(
      'rider_1',
      expect.objectContaining({
        isOnline: false,
        isAvailable: false,
      }),
    );
    expect(result.isOnline).toBe(false);
    expect(result.isAvailable).toBe(false);
    expect(result.isDispatchEligible).toBe(false);
  });

  it('rejects online requests when the rider account is not dispatch-eligible', async () => {
    const { riderAccountService, service } = makeService();
    riderAccountService.resolveOwnedRider.mockResolvedValue(
      makeRider({
        status: RiderStatus.SUSPENDED,
      }),
    );

    await expect(service.markCurrentRiderOnline(currentUser)).rejects.toMatchObject(
      {
        status: HttpStatus.CONFLICT,
      },
    );
  });
});
