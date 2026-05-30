import { UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { RiderLocationController } from '../../../../src/modules/riders/controllers/rider-location.controller';
import { RiderLocationService } from '../../../../src/modules/riders/services/rider-location.service';

describe('RiderLocationController', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_rider_1',
    role: UserRole.RIDER,
    actorContext: {
      userId: 'usr_rider_1',
      phone: '0999999999',
      role: UserRole.RIDER,
      status: UserStatus.ACTIVE,
      riderId: 'rider_1',
    },
  });

  it('delegates rider location ingest requests to the rider location service', async () => {
    const riderLocationService = {
      ingestCurrentRiderLocation: jest.fn().mockResolvedValue({
        riderId: 'rider_1',
        deliveryId: 'delivery_1',
        latitude: '16.834',
        longitude: '96.176',
        heading: null,
        speed: null,
        accuracyMeters: null,
        recordedAt: '2026-04-19T10:12:00.000Z',
        duplicate: false,
      }),
    } as unknown as jest.Mocked<RiderLocationService>;
    const controller = new RiderLocationController(riderLocationService);

    const result = await controller.ingest(currentUser, {
      latitude: 16.834,
      longitude: 96.176,
      recordedAt: '2026-04-19T10:12:00.000Z',
    });

    expect(riderLocationService.ingestCurrentRiderLocation).toHaveBeenCalledWith(
      currentUser,
      {
        latitude: 16.834,
        longitude: 96.176,
        recordedAt: '2026-04-19T10:12:00.000Z',
      },
    );
    expect(result).toMatchObject({
      riderId: 'rider_1',
      deliveryId: 'delivery_1',
      duplicate: false,
    });
  });
});
