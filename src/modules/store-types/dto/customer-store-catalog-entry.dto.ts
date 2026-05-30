import { ApiProperty } from '@nestjs/swagger';

import {
  BranchCatalogDto,
  toBranchCatalogDto,
} from '../../menus/dto/branch-catalog.dto';
import { BranchCatalogEntity } from '../../menus/entities/branch-catalog.entity';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
import {
  CustomerStoreCatalogEntrySummaryDto,
  CustomerStoreDetailDto,
  toCustomerStoreDetailDto,
} from './customer-store-detail.dto';

export class CustomerStoreCatalogEntryDto {
  @ApiProperty({
    description: 'Customer-visible store detail metadata.',
    type: CustomerStoreDetailDto,
  })
  store!: CustomerStoreDetailDto;

  @ApiProperty({
    description: 'Selected catalog entry for the chosen store type.',
    type: CustomerStoreCatalogEntrySummaryDto,
  })
  selectedCatalogEntry!: CustomerStoreCatalogEntrySummaryDto;

  @ApiProperty({
    description: 'Customer-visible catalog for the selected store-type entry.',
    type: BranchCatalogDto,
  })
  catalog!: BranchCatalogDto;
}

export function toCustomerStoreCatalogEntryDto(
  branch: CustomerStoreDiscoveryRecord,
  catalog: BranchCatalogEntity,
  selectedCatalogEntry: CustomerStoreCatalogEntrySummaryDto,
): CustomerStoreCatalogEntryDto {
  return {
    store: toCustomerStoreDetailDto(branch, catalog),
    selectedCatalogEntry,
    catalog: toBranchCatalogDto(catalog),
  };
}
