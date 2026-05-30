import { DeliveryStatus, OrderStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  dispatchQueueOrderInclude,
  DispatchQueueEntryRecord,
} from '../entities/dispatch-queue-entry.entity';

@Injectable()
export class DispatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  findQueueEntries(limit = 50): Promise<DispatchQueueEntryRecord[]> {
    return this.prisma.order.findMany({
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
      take: limit,
    });
  }

  findQueueEntryByOrderId(
    orderId: string,
  ): Promise<DispatchQueueEntryRecord | null> {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
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
  }
}
