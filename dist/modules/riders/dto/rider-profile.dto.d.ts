import { RiderStatus, UserStatus } from '@prisma/client';
import { RiderOwnershipRecord } from '../entities/rider-ownership.entity';
export declare class RiderProfileDto {
    id: string;
    phone: string;
    displayName: string;
    vehicleType: string;
    currentTownship?: string | null;
    status: RiderStatus;
    accountStatus: UserStatus;
    createdAt: string;
    updatedAt: string;
}
export declare function toRiderProfileDto(rider: RiderOwnershipRecord): RiderProfileDto;
