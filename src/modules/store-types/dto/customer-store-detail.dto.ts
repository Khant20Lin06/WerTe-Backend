import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BranchCatalogEntity } from '../../menus/entities/branch-catalog.entity';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
import {
  computeIsOpenNow,
  CustomerStoreOperatingHoursDto,
  CustomerStoreTypeBadgeDto,
} from './customer-store-summary.dto';

export class CustomerStoreCatalogEntrySummaryDto {
  @ApiProperty({
    description: 'Store type metadata for the catalog entry.',
    type: CustomerStoreTypeBadgeDto,
  })
  storeType!: CustomerStoreTypeBadgeDto;

  @ApiProperty({
    description: 'Whether this catalog entry is the branch primary entry.',
    example: true,
  })
  isPrimary!: boolean;
}

export class CustomerStoreDetailDto {
  @ApiProperty({
    description: 'Branch identifier exposed as the customer-facing store id.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
  })
  branchName!: string;

  @ApiProperty({
    description: 'Merchant identifier.',
    example: 'merchant_1',
  })
  merchantId!: string;

  @ApiProperty({
    description: 'Merchant display name.',
    example: 'City Mart',
  })
  merchantName!: string;

  @ApiPropertyOptional({
    description: 'Optional branch contact phone.',
    example: '0942000000',
  })
  contactPhone?: string | null;

  @ApiPropertyOptional({
    description: 'Optional first-line branch address.',
    example: 'No. 10, Merchant Street',
  })
  line1?: string | null;

  @ApiProperty({
    description: 'Customer-visible township label.',
    example: 'Kamaryut',
  })
  township!: string;

  @ApiPropertyOptional({
    description: 'Branch latitude serialized as string when available.',
    example: '16.8257',
  })
  latitude?: string | null;

  @ApiPropertyOptional({
    description: 'Branch longitude serialized as string when available.',
    example: '96.1421',
  })
  longitude?: string | null;

  @ApiProperty({
    description: 'Current branch status.',
    example: 'ACTIVE',
  })
  branchStatus!: string;

  @ApiProperty({
    description: 'Primary approved store type for the branch.',
    type: CustomerStoreTypeBadgeDto,
  })
  primaryStoreType!: CustomerStoreTypeBadgeDto;

  @ApiProperty({
    description: 'All approved active store types visible to customers for the branch.',
    type: CustomerStoreTypeBadgeDto,
    isArray: true,
  })
  approvedStoreTypes!: CustomerStoreTypeBadgeDto[];

  @ApiProperty({
    description: 'Store-type-specific customer catalog entries available for the branch.',
    type: CustomerStoreCatalogEntrySummaryDto,
    isArray: true,
  })
  catalogEntries!: CustomerStoreCatalogEntrySummaryDto[];

  @ApiProperty({
    description: 'Number of visible active catalog categories in the branch.',
    example: 4,
  })
  visibleCategoryCount!: number;

  @ApiProperty({
    description: 'Number of visible active catalog items in the branch.',
    example: 18,
  })
  visibleItemCount!: number;

  @ApiPropertyOptional({
    description: 'Average rating score for the branch (1-5). Null when no ratings exist.',
    example: 4.5,
    nullable: true,
  })
  averageRating!: number | null;

  @ApiProperty({
    description: 'Total number of ratings for the branch.',
    example: 12,
  })
  reviewCount!: number;

  @ApiProperty({
    description: 'Whether the branch is currently open based on its operating hours.',
    example: true,
  })
  isOpenNow!: boolean;

  @ApiPropertyOptional({
    description: 'Operating hours per day of week. Null if not configured.',
    type: CustomerStoreOperatingHoursDto,
    nullable: true,
  })
  operatingHours!: CustomerStoreOperatingHoursDto | null;
}

export function toCustomerStoreDetailDto(
  branch: CustomerStoreDiscoveryRecord,
  catalog: BranchCatalogEntity,
  ratingAggregate?: { averageRating: number | null; reviewCount: number },
): CustomerStoreDetailDto {
  const approvedStoreTypes = branch.storeTypes.map((assignment) => ({
    id: assignment.storeType.id,
    code: assignment.storeType.code,
    name: assignment.storeType.name,
    sortOrder: assignment.storeType.sortOrder,
  }));

  const catalogEntries = branch.storeTypes.map((assignment) => ({
    storeType: {
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    },
    isPrimary: assignment.isPrimary,
  }));

  const visibleItemCount =
    catalog.uncategorizedItems.length +
    catalog.categories.reduce(
      (total, category) => total + category.items.length,
      0,
    );

  const operatingHours = branch.operatingHours as CustomerStoreOperatingHoursDto | null;

  return {
    branchId: branch.id,
    branchName: branch.name,
    merchantId: branch.merchant.id,
    merchantName: branch.merchant.name,
    contactPhone: branch.contactPhone,
    line1: branch.line1,
    township: branch.township,
    latitude: branch.latitude?.toString() ?? null,
    longitude: branch.longitude?.toString() ?? null,
    branchStatus: branch.status,
    primaryStoreType: approvedStoreTypes[0]!,
    approvedStoreTypes,
    catalogEntries,
    visibleCategoryCount: catalog.categories.length,
    visibleItemCount,
    averageRating: ratingAggregate?.averageRating ?? null,
    reviewCount: ratingAggregate?.reviewCount ?? 0,
    isOpenNow: computeIsOpenNow(operatingHours),
    operatingHours,
  };
}
