import { DeliveryStatus, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  deliveryDetailInclude,
  DeliveryDetailRecord,
} from '../entities/delivery-detail.entity';

type DeliveryDatabaseClient = PrismaService | Prisma.TransactionClient;

const ACTIVE_DELIVERY_STATUSES: DeliveryStatus[] = [
  DeliveryStatus.ASSIGNED,
  DeliveryStatus.ACCEPTED,
  DeliveryStatus.PICKED_UP,
  DeliveryStatus.ON_THE_WAY,
];

@Injectable()
export class DeliveriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(
    deliveryId: string,
    client: DeliveryDatabaseClient = this.prisma,
  ): Promise<DeliveryDetailRecord | null> {
    return client.delivery.findUnique({
      where: {
        id: deliveryId,
      },
      include: deliveryDetailInclude,
    });
  }

  findByOrderId(
    orderId: string,
    client: DeliveryDatabaseClient = this.prisma,
  ): Promise<DeliveryDetailRecord | null> {
    return client.delivery.findUnique({
      where: {
        orderId,
      },
      include: deliveryDetailInclude,
    });
  }

  findRiderActiveDelivery(riderId: string): Promise<DeliveryDetailRecord | null> {
    return this.prisma.delivery.findFirst({
      where: {
        riderId,
        status: {
          in: ACTIVE_DELIVERY_STATUSES,
        },
      },
      include: deliveryDetailInclude,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
  }

  findRiderDeliveryById(
    deliveryId: string,
    riderId: string,
    client: DeliveryDatabaseClient = this.prisma,
  ): Promise<DeliveryDetailRecord | null> {
    return client.delivery.findFirst({
      where: {
        id: deliveryId,
        riderId,
      },
      include: deliveryDetailInclude,
    });
  }

  updateById(
    deliveryId: string,
    data: Prisma.DeliveryUpdateInput,
    client: DeliveryDatabaseClient = this.prisma,
  ): Promise<DeliveryDetailRecord> {
    return client.delivery.update({
      where: {
        id: deliveryId,
      },
      data,
      include: deliveryDetailInclude,
    });
  }

  upsertAssignedDelivery(
    orderId: string,
    payload: {
      riderId: string;
      etaMinutes: number | null;
      assignedAt: Date;
    },
    client: DeliveryDatabaseClient = this.prisma,
  ): Promise<DeliveryDetailRecord> {
    return client.delivery.upsert({
      where: {
        orderId,
      },
      create: {
        orderId,
        riderId: payload.riderId,
        status: DeliveryStatus.ASSIGNED,
        etaMinutes: payload.etaMinutes,
        assignedAt: payload.assignedAt,
      },
      update: {
        riderId: payload.riderId,
        status: DeliveryStatus.ASSIGNED,
        etaMinutes: payload.etaMinutes,
        assignedAt: payload.assignedAt,
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
  }
}
