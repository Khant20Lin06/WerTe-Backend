import { BranchStatus, MerchantStatus, Prisma, UserRole, UserStatus, ZoneStatus } from '@prisma/client';
export declare const branchOwnershipInclude: {
    merchant: {
        select: {
            id: true;
            userId: true;
            name: true;
            storeType: true;
            status: true;
            user: {
                select: {
                    id: true;
                    phone: true;
                    role: true;
                    status: true;
                };
            };
        };
    };
    branchZones: {
        select: {
            zoneId: true;
            zone: {
                select: {
                    id: true;
                    code: true;
                    name: true;
                    status: true;
                };
            };
        };
    };
    staffAssignments: {
        select: {
            staffId: true;
        };
    };
};
export type BranchOwnershipRecord = Prisma.BranchGetPayload<{
    include: typeof branchOwnershipInclude;
}>;
export declare class BranchZoneSummaryEntity {
    zoneId: string;
    code: string;
    name: string;
    status: ZoneStatus;
}
export declare class BranchOwnershipEntity {
    branchId: string;
    merchantId: string;
    merchantUserId: string;
    merchantName: string;
    merchantStoreType: string;
    merchantStatus: MerchantStatus;
    phone: string;
    role: UserRole;
    userStatus: UserStatus;
    name: string;
    township: string;
    storeType: string;
    status: BranchStatus;
    zones: BranchZoneSummaryEntity[];
}
export declare function buildBranchOwnership(branch: BranchOwnershipRecord): BranchOwnershipEntity;
