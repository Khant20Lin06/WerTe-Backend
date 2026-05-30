import { UserStatus } from '@prisma/client';
import { CustomerProfileOwnershipRecord } from '../entities/customer-profile-ownership.entity';
export declare class CustomerProfileDto {
    id: string;
    phone: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}
export declare function toCustomerProfileDto(profile: CustomerProfileOwnershipRecord): CustomerProfileDto;
