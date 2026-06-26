import { MerchantStaffRole, MerchantStatus, RiderStatus, StaffStatus, UserRole, UserStatus } from '@prisma/client';
export declare class ActorContextDto {
    userId: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    customerProfileId?: string;
    riderId?: string;
    riderStatus?: RiderStatus;
    merchantId?: string;
    merchantStatus?: MerchantStatus;
    staffMemberId?: string;
    staffRole?: MerchantStaffRole;
    staffStatus?: StaffStatus;
    staffBranchIds?: string[];
    staffMerchantId?: string;
}
