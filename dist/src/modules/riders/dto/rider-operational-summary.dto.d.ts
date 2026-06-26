import { RiderStatus, UserStatus } from '@prisma/client';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
export declare class RiderOperationalSummaryDto {
    riderId: string;
    status: RiderStatus;
    accountStatus: UserStatus;
    vehicleType: string;
    currentTownship?: string | null;
    isDispatchEligible: boolean;
    isOnline: boolean;
    isAvailable: boolean;
    lastStatusChangedAt: string | null;
    updatedAt: string;
}
export declare function toRiderOperationalSummaryDto(rider: RiderOwnershipRecord): RiderOperationalSummaryDto;
