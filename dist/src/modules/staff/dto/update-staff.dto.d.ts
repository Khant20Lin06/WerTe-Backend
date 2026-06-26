import { MerchantStaffRole, StaffStatus } from '@prisma/client';
export declare class UpdateStaffDto {
    role?: MerchantStaffRole;
    status?: StaffStatus;
    branchIds?: string[];
}
