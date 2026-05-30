import { HttpStatus } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { DeliveriesRepository } from '../../../../src/modules/deliveries/repositories/deliveries.repository';
import { DeliveryQueryService } from '../../../../src/modules/deliveries/services/delivery-query.service';

describe('DeliveryQueryService', () => {
  const riderUser = makeAuthenticatedUser({
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

  const makeService = () => {
    const repository = {
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      findRiderActiveDelivery: jest.fn(),
      findRiderDeliveryById: jest.fn(),
    } as unknown as jest.Mocked<DeliveriesRepository>;
    const service = new DeliveryQueryService(repository);

    return { repository, service };
  };

  it('returns null when the rider has no active delivery yet', async () => {
    const { repository, service } = makeService();
    repository.findRiderActiveDelivery.mockResolvedValue(null);

    await expect(service.getRiderActiveDelivery(riderUser)).resolves.toBeNull();
    expect(repository.findRiderActiveDelivery).toHaveBeenCalledWith('rider_1');
  });

  it('throws forbidden when the actor has no rider scope', async () => {
    const { service } = makeService();
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0990000000',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    await expect(service.getRiderActiveDelivery(currentUser)).rejects.toMatchObject(
      {
        status: HttpStatus.FORBIDDEN,
      },
    );
  });
});
