import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
export declare class CustomerStoreOperatingDayDto {
    open: boolean;
    openTime?: string;
    closeTime?: string;
}
export declare class CustomerStoreOperatingHoursDto {
    mon?: CustomerStoreOperatingDayDto;
    tue?: CustomerStoreOperatingDayDto;
    wed?: CustomerStoreOperatingDayDto;
    thu?: CustomerStoreOperatingDayDto;
    fri?: CustomerStoreOperatingDayDto;
    sat?: CustomerStoreOperatingDayDto;
    sun?: CustomerStoreOperatingDayDto;
}
export declare class CustomerStoreTypeBadgeDto {
    id: string;
    code: string;
    name: string;
    sortOrder: number;
}
export declare class CustomerStoreSummaryDto {
    branchId: string;
    branchName: string;
    merchantId: string;
    merchantName: string;
    township: string;
    primaryStoreType: CustomerStoreTypeBadgeDto;
    approvedStoreTypes: CustomerStoreTypeBadgeDto[];
    averageRating: number | null;
    reviewCount: number;
    isOpenNow: boolean;
    operatingHours: CustomerStoreOperatingHoursDto | null;
}
export type CustomerStoreSummaryOptions = {
    preferredStoreTypeCodes?: string[];
    averageRating?: number | null;
    reviewCount?: number;
};
export declare function toCustomerStoreSummaryDto(branch: CustomerStoreDiscoveryRecord, options?: CustomerStoreSummaryOptions): CustomerStoreSummaryDto;
export declare function computeIsOpenNow(hours: CustomerStoreOperatingHoursDto | null): boolean;
