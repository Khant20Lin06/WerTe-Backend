import { Prisma, RiderStatus, UserRole, UserStatus } from '@prisma/client';

export const riderOwnershipInclude = Prisma.validator<Prisma.RiderInclude>()({
  user: {
    select: {
      id: true,
      phone: true,
      role: true,
      status: true,
    },
  },
  availability: {
    select: {
      isOnline: true,
      isAvailable: true,
      lastStatusChangedAt: true,
      updatedAt: true,
    },
  },
});

export type RiderOwnershipRecord = Prisma.RiderGetPayload<{
  include: typeof riderOwnershipInclude;
}>;

export type RiderCurrentLocation = Prisma.RiderCurrentLocationGetPayload<
  Prisma.RiderCurrentLocationDefaultArgs
>;

export type RiderLocationHistory = Prisma.RiderLocationHistoryGetPayload<
  Prisma.RiderLocationHistoryDefaultArgs
>;

export class RiderOwnershipEntity {
  riderId!: string;
  userId!: string;
  phone!: string;
  role!: UserRole;
  userStatus!: UserStatus;
  displayName!: string;
  vehicleType!: string;
  plateNumber?: string | null;
  currentTownship?: string | null;
  weeklySchedule!: Prisma.JsonValue | null;
  status!: RiderStatus;
  availability!: RiderAvailabilitySnapshotEntity | null;
}

export class RiderAvailabilitySnapshotEntity {
  isOnline!: boolean;
  isAvailable!: boolean;
  lastStatusChangedAt!: string;
  updatedAt!: string;
}

export function buildRiderOwnership(
  rider: RiderOwnershipRecord,
): RiderOwnershipEntity {
  return {
    riderId: rider.id,
    userId: rider.user.id,
    phone: rider.user.phone,
    role: rider.user.role,
    userStatus: rider.user.status,
    displayName: rider.displayName,
    vehicleType: rider.vehicleType,
    plateNumber: rider.plateNumber,
    currentTownship: rider.currentTownship,
    weeklySchedule: rider.weeklySchedule,
    status: rider.status,
    availability:
      rider.availability === null
        ? null
        : {
            isOnline: rider.availability.isOnline,
            isAvailable: rider.availability.isAvailable,
            lastStatusChangedAt:
              rider.availability.lastStatusChangedAt.toISOString(),
            updatedAt: rider.availability.updatedAt.toISOString(),
          },
  };
}
