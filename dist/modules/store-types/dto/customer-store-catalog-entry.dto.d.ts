import { BranchCatalogDto } from '../../menus/dto/branch-catalog.dto';
import { BranchCatalogEntity } from '../../menus/entities/branch-catalog.entity';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
import { CustomerStoreCatalogEntrySummaryDto, CustomerStoreDetailDto } from './customer-store-detail.dto';
export declare class CustomerStoreCatalogEntryDto {
    store: CustomerStoreDetailDto;
    selectedCatalogEntry: CustomerStoreCatalogEntrySummaryDto;
    catalog: BranchCatalogDto;
}
export declare function toCustomerStoreCatalogEntryDto(branch: CustomerStoreDiscoveryRecord, catalog: BranchCatalogEntity, selectedCatalogEntry: CustomerStoreCatalogEntrySummaryDto): CustomerStoreCatalogEntryDto;
