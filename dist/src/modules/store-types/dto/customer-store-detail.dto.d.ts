import { BranchCatalogEntity } from '../../menus/entities/branch-catalog.entity';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
import { CustomerStoreOperatingHoursDto, CustomerStoreTypeBadgeDto } from './customer-store-summary.dto';
export declare class CustomerStoreCatalogEntrySummaryDto {
    storeType: CustomerStoreTypeBadgeDto;
    isPrimary: boolean;
}
export declare class CustomerStoreDetailDto {
    branchId: string;
    branchName: string;
    merchantId: string;
    merchantName: string;
    contactPhone?: string | null;
    line1?: string | null;
    township: string;
    latitude?: string | null;
    longitude?: string | null;
    branchStatus: string;
    primaryStoreType: CustomerStoreTypeBadgeDto;
    approvedStoreTypes: CustomerStoreTypeBadgeDto[];
    catalogEntries: CustomerStoreCatalogEntrySummaryDto[];
    visibleCategoryCount: number;
    visibleItemCount: number;
    averageRating: number | null;
    reviewCount: number;
    isOpenNow: boolean;
    operatingHours: CustomerStoreOperatingHoursDto | null;
}
export declare function toCustomerStoreDetailDto(branch: CustomerStoreDiscoveryRecord, catalog: BranchCatalogEntity, ratingAggregate?: {
    averageRating: number | null;
    reviewCount: number;
}): CustomerStoreDetailDto;
