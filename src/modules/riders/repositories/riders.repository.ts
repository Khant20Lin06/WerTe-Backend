import { Injectable } from '@nestjs/common';
import { Prisma, RiderStatus, UserStatus } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  RiderCurrentLocation,
  RiderLocationHistory,
  RiderOwnershipRecord,
  riderOwnershipInclude,
} from '../entities/rider-ownership.entity';

type RiderDatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class RidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<RiderOwnershipRecord | null> {
    return this.prisma.rider.findUnique({
      where: { id },
      include: riderOwnershipInclude,
    });
  }

  findByUserId(userId: string): Promise<RiderOwnershipRecord | null> {
    return this.prisma.rider.findUnique({
      where: { userId },
      include: riderOwnershipInclude,
    });
  }

  findEligibleRiders(options?: {
    township?: string | null;
  }): Promise<RiderOwnershipRecord[]> {
    return this.prisma.rider.findMany({
      where: {
        status: RiderStatus.ACTIVE,
        user: { status: UserStatus.ACTIVE },
        availability: {
          isOnline: true,
          isAvailable: true,
        },
        // Exclude riders already on an active delivery
        deliveries: {
          none: {
            status: { in: ['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'] },
          },
        },
        ...(options?.township
          ? { currentTownship: options.township }
          : {}),
      },
      include: riderOwnershipInclude,
      orderBy: [
        // Prefer riders whose availability changed most recently (just came online)
        { availability: { lastStatusChangedAt: 'asc' } },
        { id: 'asc' },
      ],
    });
  }

  update(
    id: string,
    data: Prisma.RiderUpdateInput,
    client: RiderDatabaseClient = this.prisma,
  ): Promise<RiderOwnershipRecord> {
    return client.rider.update({
      where: { id },
      data,
      include: riderOwnershipInclude,
    });
  }

  upsertAvailability(
    riderId: string,
    data: {
      isOnline: boolean;
      isAvailable: boolean;
      lastStatusChangedAt: Date;
    },
    client: RiderDatabaseClient = this.prisma,
  ): Promise<RiderOwnershipRecord> {
    return client.rider.update({
      where: { id: riderId },
      data: {
        availability: {
          upsert: {
            create: {
              isOnline: data.isOnline,
              isAvailable: data.isAvailable,
              lastStatusChangedAt: data.lastStatusChangedAt,
            },
            update: {
              isOnline: data.isOnline,
              isAvailable: data.isAvailable,
              lastStatusChangedAt: data.lastStatusChangedAt,
            },
          },
        },
      },
      include: riderOwnershipInclude,
    });
  }

  findCurrentLocationByRiderId(
    riderId: string,
    client: RiderDatabaseClient = this.prisma,
  ): Promise<RiderCurrentLocation | null> {
    return client.riderCurrentLocation.findUnique({
      where: {
        riderId,
      },
    });
  }

  upsertCurrentLocation(
    riderId: string,
    data: {
      deliveryId: string | null;
      latitude: Prisma.Decimal | number | string;
      longitude: Prisma.Decimal | number | string;
      heading?: Prisma.Decimal | number | string | null;
      speed?: Prisma.Decimal | number | string | null;
      accuracyMeters?: Prisma.Decimal | number | string | null;
      recordedAt: Date;
    },
    client: RiderDatabaseClient = this.prisma,
  ): Promise<RiderCurrentLocation> {
    return client.riderCurrentLocation.upsert({
      where: {
        riderId,
      },
      create: {
        riderId,
        deliveryId: data.deliveryId,
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading ?? null,
        speed: data.speed ?? null,
        accuracyMeters: data.accuracyMeters ?? null,
        recordedAt: data.recordedAt,
      },
      update: {
        deliveryId: data.deliveryId,
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading ?? null,
        speed: data.speed ?? null,
        accuracyMeters: data.accuracyMeters ?? null,
        recordedAt: data.recordedAt,
      },
    });
  }

  createLocationHistory(
    riderId: string,
    data: {
      deliveryId: string | null;
      latitude: Prisma.Decimal | number | string;
      longitude: Prisma.Decimal | number | string;
      heading?: Prisma.Decimal | number | string | null;
      speed?: Prisma.Decimal | number | string | null;
      accuracyMeters?: Prisma.Decimal | number | string | null;
      recordedAt: Date;
    },
    client: RiderDatabaseClient = this.prisma,
  ): Promise<RiderLocationHistory> {
    return client.riderLocationHistory.create({
      data: {
        riderId,
        deliveryId: data.deliveryId,
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading ?? null,
        speed: data.speed ?? null,
        accuracyMeters: data.accuracyMeters ?? null,
        recordedAt: data.recordedAt,
      },
    });
  }
}
