import { BranchStatus, BranchStoreTypeStatus, UserRole } from '@prisma/client';
import { BranchStoreTypeManagementRecord } from '../entities/branch-store-type-management.entity';
export declare class BranchStoreTypeDto {
    branchId: string;
    branchName: string;
    merchantId: string;
    merchantName: string;
    branchStatus: BranchStatus;
    storeTypeId: string;
    storeTypeCode: string;
    storeTypeName: string;
    storeTypeIsActive: boolean;
    storeTypeIsSystem: boolean;
    status: BranchStoreTypeStatus;
    isPrimary: boolean;
    sortOrder: number;
    requestedByUserId?: string | null;
    requestedByUserRole?: UserRole | null;
    approvedByUserId?: string | null;
    approvedByUserRole?: UserRole | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    hiddenAt?: string | null;
    reason?: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare function toBranchStoreTypeDto(assignment: BranchStoreTypeManagementRecord): BranchStoreTypeDto;
