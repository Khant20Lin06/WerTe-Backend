import { MerchantStatus, MerchantStaffRole, Prisma, RiderStatus, StaffStatus, UserRole, UserStatus } from '@prisma/client';
export declare const userIdentityInclude: {
    customerProfile: {
        select: {
            id: true;
        };
    };
    riderProfile: {
        select: {
            id: true;
            status: true;
        };
    };
    merchantProfile: {
        select: {
            id: true;
            status: true;
        };
    };
    staffProfile: {
        select: {
            id: true;
            merchantId: true;
            role: true;
            status: true;
            branchAssignments: {
                select: {
                    branchId: true;
                };
            };
        };
    };
};
export type UserIdentityRecord = Prisma.UserGetPayload<{
    include: typeof userIdentityInclude;
}>;
export declare class ActorContextEntity {
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
export declare function buildActorContext(user: UserIdentityRecord): ActorContextEntity;
