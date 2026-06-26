import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';
export declare class StoreTypeDto {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
    isActive: boolean;
    isSystem: boolean;
    sortOrder: number;
    branchAssignmentCount: number;
    branchPrimaryCount: number;
    merchantPrimaryCount: number;
    deletedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare function toStoreTypeDto(storeType: StoreTypeManagementRecord): StoreTypeDto;
