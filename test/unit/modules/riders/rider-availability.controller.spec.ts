import { RiderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { RiderAvailabilityController } from '../../../../src/modules/riders/controllers/rider-availability.controller';
import { RiderAvailabilityService } from '../../../../src/modules/riders/services/rider-availability.service';

describe('RiderAvailabilityController', () => {
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

  const availabilitySnapshot = {
    riderId: 'rider_1',
    status: RiderStatus.ACTIVE,
    accountStatus: UserStatus.ACTIVE,
    currentTownship: 'Kamaryut',
    isOnline: true,
    isAvailable: true,
    isDispatchEligible: true,
    lastStatusChangedAt: '2026-04-19T00:05:00.000Z',
    updatedAt: '2026-04-19T00:05:00.000Z',
  };

  it('delegates availability reads to the rider availability service', async () => {
    const riderAvailabilityService = {
      getCurrentAvailability: jest.fn().mockResolvedValue(availabilitySnapshot),
    } as unknown as jest.Mocked<RiderAvailabilityService>;
    const controller = new RiderAvailabilityController(riderAvailabilityService);

    const result = await controller.getCurrentAvailability(currentUser);

    expect(riderAvailabilityService.getCurrentAvailability).toHaveBeenCalledWith(
      currentUser,
    );
    expect(result).toEqual(availabilitySnapshot);
  });

  it('delegates online requests to the rider availability service', async () => {
    const riderAvailabilityService = {
      markCurrentRiderOnline: jest.fn().mockResolvedValue(availabilitySnapshot),
    } as unknown as jest.Mocked<RiderAvailabilityService>;
    const controller = new RiderAvailabilityController(riderAvailabilityService);

    const result = await controller.markOnline(currentUser);

    expect(riderAvailabilityService.markCurrentRiderOnline).toHaveBeenCalledWith(
      currentUser,
    );
    expect(result).toEqual(availabilitySnapshot);
  });

  it('delegates offline requests to the rider availability service', async () => {
    const riderAvailabilityService = {
      markCurrentRiderOffline: jest.fn().mockResolvedValue({
        ...availabilitySnapshot,
        isOnline: false,
        isAvailable: false,
        isDispatchEligible: false,
      }),
    } as unknown as jest.Mocked<RiderAvailabilityService>;
    const controller = new RiderAvailabilityController(riderAvailabilityService);

    const result = await controller.markOffline(currentUser);

    expect(
      riderAvailabilityService.markCurrentRiderOffline,
    ).toHaveBeenCalledWith(currentUser);
    expect(result).toMatchObject({
      isOnline: false,
      isAvailable: false,
      isDispatchEligible: false,
    });
  });
});
