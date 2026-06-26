import { BranchStoreTypeStatus } from '@prisma/client';
export declare class ListAdminBranchStoreTypesQueryDto {
    branchId?: string;
    storeTypeId?: string;
    status?: BranchStoreTypeStatus;
}
