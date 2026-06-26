import { MerchantStaffRole } from '@prisma/client';
export declare class InviteStaffDto {
    phone: string;
    displayName: string;
    role: MerchantStaffRole;
    password: string;
    branchIds?: string[];
}
