import { BranchStoreTypeStatus } from '@prisma/client';
export declare class ManageBranchStoreTypeDto {
    storeTypeId: string;
    status?: BranchStoreTypeStatus;
    isPrimary?: boolean;
    sortOrder?: number;
    reason?: string;
}
