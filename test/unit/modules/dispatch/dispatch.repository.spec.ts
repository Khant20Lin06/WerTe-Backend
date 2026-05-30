import { DeliveryStatus, OrderStatus } from '@prisma/client';

import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { dispatchQueueOrderInclude } from '../../../../src/modules/dispatch/entities/dispatch-queue-entry.entity';
import { DispatchRepository } from '../../../../src/modules/dispatch/repositories/dispatch.repository';

function makeRepository() {
  const prisma = {
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;

  return {
    prisma,
    repository: new DispatchRepository(prisma),
  };
}

describe('DispatchRepository', () => {
  it('lists dispatch queue entries from preparing and rider-assigned orders in ascending placement order', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    await repository.findQueueEntries();

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            status: OrderStatus.PREPARING,
          },
          {
            status: OrderStatus.RIDER_ASSIGNED,
            delivery: {
              is: {
                status: {
                  in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PENDING_ASSIGNMENT],
                },
              },
            },
          },
        ],
      },
      include: dispatchQueueOrderInclude,
      orderBy: [{ placedAt: 'asc' }, { id: 'asc' }],
      take: 50,
    });
  });

  it('loads a single queue entry by order id using the shared queue include', async () => {
    const { prisma, repository } = makeRepository();
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    await repository.findQueueEntryByOrderId('order_1');

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'order_1',
        OR: [
          {
            status: OrderStatus.PREPARING,
          },
          {
            status: OrderStatus.RIDER_ASSIGNED,
            delivery: {
              is: {
                status: {
                  in: [DeliveryStatus.ASSIGNED, DeliveryStatus.PENDING_ASSIGNMENT],
                },
              },
            },
          },
        ],
      },
      include: dispatchQueueOrderInclude,
    });
  });
});
