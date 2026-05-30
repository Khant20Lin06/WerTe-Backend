import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';

export class StoreTypeDto {
  @ApiProperty({
    description: 'Store type identifier.',
    example: 'store_type_restaurant',
  })
  id!: string;

  @ApiProperty({
    description: 'Short unique code used across catalog and branch workflows.',
    example: 'restaurant',
  })
  code!: string;

  @ApiProperty({
    description: 'Human-readable store type name.',
    example: 'Restaurant',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional store type description.',
    example: 'Prepared food and beverage merchants.',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Optional store type icon url.',
    example: 'https://cdn.example.com/icons/restaurant.svg',
  })
  iconUrl?: string | null;

  @ApiProperty({
    description: 'Whether this store type is currently available for assignment.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Whether this store type is part of the system seed registry.',
    example: false,
  })
  isSystem!: boolean;

  @ApiProperty({
    description: 'Presentation sort order.',
    example: 10,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Number of branch store type assignments referencing this store type.',
    example: 24,
  })
  branchAssignmentCount!: number;

  @ApiProperty({
    description: 'Number of branches currently using this store type as primary.',
    example: 8,
  })
  branchPrimaryCount!: number;

  @ApiProperty({
    description: 'Number of merchants currently using this store type as primary.',
    example: 4,
  })
  merchantPrimaryCount!: number;

  @ApiPropertyOptional({
    description: 'Soft-delete timestamp when archived.',
    example: '2026-04-30T08:00:00.000Z',
  })
  deletedAt?: string | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-04-30T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-04-30T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toStoreTypeDto(storeType: StoreTypeManagementRecord): StoreTypeDto {
  return {
    id: storeType.id,
    code: storeType.code,
    name: storeType.name,
    description: storeType.description,
    iconUrl: storeType.iconUrl,
    isActive: storeType.isActive,
    isSystem: storeType.isSystem,
    sortOrder: storeType.sortOrder,
    branchAssignmentCount: storeType._count.branchAssignments,
    branchPrimaryCount: storeType._count.branchPrimaries,
    merchantPrimaryCount: storeType._count.merchantPrimaries,
    deletedAt: storeType.deletedAt?.toISOString() ?? null,
    createdAt: storeType.createdAt.toISOString(),
    updatedAt: storeType.updatedAt.toISOString(),
  };
}
