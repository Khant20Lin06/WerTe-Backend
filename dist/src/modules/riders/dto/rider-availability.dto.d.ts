import { RiderStatus, UserStatus } from '@prisma/client';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
export declare class RiderAvailabilityDto {
    riderId: string;
    status: RiderStatus;
    accountStatus: UserStatus;
    currentTownship?: string | null;
    isOnline: boolean;
    isAvailable: boolean;
    isDispatchEligible: boolean;
    lastStatusChangedAt: string | null;
    updatedAt: string;
}
export declare function isRiderDispatchEligible(rider: RiderOwnershipRecord): boolean;
export declare function toRiderAvailabilityDto(rider: RiderOwnershipRecord): RiderAvailabilityDto;
