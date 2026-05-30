import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { StoreTypeManagementRecord } from '../entities/store-type-management.entity';

export class AvailableStoreTypeDto {
  @ApiProperty({
    description: 'Store type identifier.',
    example: 'store_type_grocery',
  })
  id!: string;

  @ApiProperty({
    description: 'Short unique store type code.',
    example: 'grocery',
  })
  code!: string;

  @ApiProperty({
    description: 'Human-readable store type name.',
    example: 'Grocery',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional store type description.',
    example: 'Retail grocery and pantry storefronts.',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Optional store type icon url.',
    example: 'https://cdn.example.com/icons/grocery.svg',
  })
  iconUrl?: string | null;

  @ApiProperty({
    description: 'Presentation sort order.',
    example: 20,
  })
  sortOrder!: number;
}

export function toAvailableStoreTypeDto(
  storeType: StoreTypeManagementRecord,
): AvailableStoreTypeDto {
  return {
    id: storeType.id,
    code: storeType.code,
    name: storeType.name,
    description: storeType.description,
    iconUrl: storeType.iconUrl,
    sortOrder: storeType.sortOrder,
  };
}
