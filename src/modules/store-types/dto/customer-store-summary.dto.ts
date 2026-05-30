import { ApiProperty } from '@nestjs/swagger';

import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';

export class CustomerStoreTypeBadgeDto {
  @ApiProperty({
    description: 'Store type identifier.',
    example: 'store_type_grocery',
  })
  id!: string;

  @ApiProperty({
    description: 'Store type code.',
    example: 'grocery',
  })
  code!: string;

  @ApiProperty({
    description: 'Store type display name.',
    example: 'Grocery',
  })
  name!: string;

  @ApiProperty({
    description: 'Presentation sort order for the store type.',
    example: 10,
  })
  sortOrder!: number;
}

export class CustomerStoreSummaryDto {
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
    example: 'Tea House',
  })
  merchantName!: string;

  @ApiProperty({
    description: 'Customer-visible township label.',
    example: 'Kamaryut',
  })
  township!: string;

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
}

export type CustomerStoreSummaryOptions = {
  preferredStoreTypeCodes?: string[];
};

export function toCustomerStoreSummaryDto(
  branch: CustomerStoreDiscoveryRecord,
  options?: CustomerStoreSummaryOptions,
): CustomerStoreSummaryDto {
  const approvedStoreTypes = branch.storeTypes.map((assignment) => ({
    id: assignment.storeType.id,
    code: assignment.storeType.code,
    name: assignment.storeType.name,
    sortOrder: assignment.storeType.sortOrder,
  }));

  const preferredStoreTypeCodeSet = new Set(
    (options?.preferredStoreTypeCodes ?? []).map((code) => code.toLowerCase()),
  );
  const primaryStoreType =
    approvedStoreTypes.find((storeType) =>
      preferredStoreTypeCodeSet.has(storeType.code.toLowerCase()),
    ) ?? approvedStoreTypes[0];

  return {
    branchId: branch.id,
    branchName: branch.name,
    merchantId: branch.merchant.id,
    merchantName: branch.merchant.name,
    township: branch.township,
    primaryStoreType,
    approvedStoreTypes,
  };
}
