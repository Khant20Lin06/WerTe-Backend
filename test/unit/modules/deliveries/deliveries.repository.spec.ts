import { DeliveryStatus } from '@prisma/client';

import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import {
  deliveryDetailInclude,
} from '../../../../src/modules/deliveries/entities/delivery-detail.entity';
import { DeliveriesRepository } from '../../../../src/modules/deliveries/repositories/deliveries.repository';

function makeRepository() {
  const prisma = {
    delivery: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
  } as unknown as PrismaService;

  return {
    prisma,
    repository: new DeliveriesRepository(prisma),
  };
}

describe('DeliveriesRepository', () => {
  it('loads delivery detail by id with the shared include', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue(null);

    await repository.findById('delivery_1');

    expect(prisma.delivery.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'delivery_1',
      },
      include: deliveryDetailInclude,
    });
  });

  it('loads delivery detail by order id with the shared include', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.delivery.findUnique as jest.Mock).mockResolvedValue(null);

    await repository.findByOrderId('order_1');

    expect(prisma.delivery.findUnique).toHaveBeenCalledWith({
      where: {
        orderId: 'order_1',
      },
      include: deliveryDetailInclude,
    });
  });

  it('loads rider active delivery using fulfillment-active statuses in descending update order', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.delivery.findFirst as jest.Mock).mockResolvedValue(null);

    await repository.findRiderActiveDelivery('rider_1');

    expect(prisma.delivery.findFirst).toHaveBeenCalledWith({
      where: {
        riderId: 'rider_1',
        status: {
          in: [
            DeliveryStatus.ASSIGNED,
            DeliveryStatus.ACCEPTED,
            DeliveryStatus.PICKED_UP,
            DeliveryStatus.ON_THE_WAY,
          ],
        },
      },
      include: deliveryDetailInclude,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
  });

  it('upserts rider assignment snapshots for the order delivery record', async () => {
    const { prisma, repository } = makeRepository();
    const upsert = prisma.delivery.upsert as unknown as jest.Mock;
    upsert.mockResolvedValue({});

    const assignedAt = new Date('2026-04-19T10:10:00.000Z');
    await repository.upsertAssignedDelivery('order_1', {
      riderId: 'rider_1',
      etaMinutes: 18,
      assignedAt,
    });

    expect(upsert).toHaveBeenCalledWith({
      where: {
        orderId: 'order_1',
      },
      create: {
        orderId: 'order_1',
        riderId: 'rider_1',
        status: DeliveryStatus.ASSIGNED,
        etaMinutes: 18,
        assignedAt,
      },
      update: {
        riderId: 'rider_1',
        status: DeliveryStatus.ASSIGNED,
        etaMinutes: 18,
        assignedAt,
        acceptedAt: null,
        pickedUpAt: null,
        onTheWayAt: null,
        deliveredAt: null,
        failedAt: null,
        cancelledAt: null,
        failureReasonCode: null,
        failureNote: null,
      },
      include: deliveryDetailInclude,
    });
  });
});
