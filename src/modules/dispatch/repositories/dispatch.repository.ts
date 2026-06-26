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
          { status: OrderStatus.MERCHANT_ACCEPTED },
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
          { status: OrderStatus.MERCHANT_ACCEPTED },
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

  // Orders that are MERCHANT_ACCEPTED, have no delivery record, and require rider dispatch (DELIVERY type only).
  findReadyOrdersWithoutRider(options?: {
    township?: string | null;
    limit?: number;
  }): Promise<DispatchQueueEntryRecord[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.MERCHANT_ACCEPTED,
        delivery: { is: null },
        deliveryType: 'DELIVERY',
        ...(options?.township
          ? { deliveryTownship: options.township }
          : {}),
      },
      include: dispatchQueueOrderInclude,
      orderBy: [{ placedAt: 'asc' }, { id: 'asc' }],
      take: options?.limit ?? 20,
    });
  }
}
