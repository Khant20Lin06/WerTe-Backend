import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';

export class CustomerStoreOperatingDayDto {
  @ApiProperty({ example: true })
  open!: boolean;

  @ApiPropertyOptional({ example: '09:00' })
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  closeTime?: string;
}

export class CustomerStoreOperatingHoursDto {
  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  mon?: CustomerStoreOperatingDayDto;

  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  tue?: CustomerStoreOperatingDayDto;

  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  wed?: CustomerStoreOperatingDayDto;

  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  thu?: CustomerStoreOperatingDayDto;

  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  fri?: CustomerStoreOperatingDayDto;

  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  sat?: CustomerStoreOperatingDayDto;

  @ApiPropertyOptional({ type: CustomerStoreOperatingDayDto })
  sun?: CustomerStoreOperatingDayDto;
}

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

export type CustomerStoreSummaryOptions = {
  preferredStoreTypeCodes?: string[];
  averageRating?: number | null;
  reviewCount?: number;
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

  const operatingHours = branch.operatingHours as CustomerStoreOperatingHoursDto | null;

  return {
    branchId: branch.id,
    branchName: branch.name,
    merchantId: branch.merchant.id,
    merchantName: branch.merchant.name,
    township: branch.township,
    primaryStoreType,
    approvedStoreTypes,
    averageRating: options?.averageRating ?? null,
    reviewCount: options?.reviewCount ?? 0,
    isOpenNow: computeIsOpenNow(operatingHours),
    operatingHours,
  };
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function computeIsOpenNow(hours: CustomerStoreOperatingHoursDto | null): boolean {
  if (!hours) return true;
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const day = hours[dayKey];
  if (!day || !day.open) return false;
  if (!day.openTime || !day.closeTime) return true;
  const pad = (n: number) => String(n).padStart(2, '0');
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return current >= day.openTime && current <= day.closeTime;
}
