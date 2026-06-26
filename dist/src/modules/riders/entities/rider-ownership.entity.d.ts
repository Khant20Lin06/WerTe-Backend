import { Prisma, RiderStatus, UserRole, UserStatus } from '@prisma/client';
export declare const riderOwnershipInclude: {
    user: {
        select: {
            id: true;
            phone: true;
            role: true;
            status: true;
        };
    };
    availability: {
        select: {
            isOnline: true;
            isAvailable: true;
            lastStatusChangedAt: true;
            updatedAt: true;
        };
    };
};
export type RiderOwnershipRecord = Prisma.RiderGetPayload<{
    include: typeof riderOwnershipInclude;
}>;
export type RiderCurrentLocation = Prisma.RiderCurrentLocationGetPayload<Prisma.RiderCurrentLocationDefaultArgs>;
export type RiderLocationHistory = Prisma.RiderLocationHistoryGetPayload<Prisma.RiderLocationHistoryDefaultArgs>;
export declare class RiderOwnershipEntity {
    riderId: string;
    userId: string;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    displayName: string;
    vehicleType: string;
    currentTownship?: string | null;
    status: RiderStatus;
    availability: RiderAvailabilitySnapshotEntity | null;
}
export declare class RiderAvailabilitySnapshotEntity {
    isOnline: boolean;
    isAvailable: boolean;
    lastStatusChangedAt: string;
    updatedAt: string;
}
export declare function buildRiderOwnership(rider: RiderOwnershipRecord): RiderOwnershipEntity;
