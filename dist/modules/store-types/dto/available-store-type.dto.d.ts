import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';
export declare class AvailableStoreTypeDto {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
    sortOrder: number;
}
export declare function toAvailableStoreTypeDto(storeType: StoreTypeManagementRecord): AvailableStoreTypeDto;
