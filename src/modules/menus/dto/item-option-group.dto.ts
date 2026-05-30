import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemOptionGroupKind } from '@prisma/client';

import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';

export class ItemOptionGroupDto {
  @ApiProperty({
    description: 'Item option group identifier.',
    example: 'group_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Branch identifier that owns the option group.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Menu item identifier that owns the option group.',
    example: 'item_1',
  })
  menuItemId!: string;

  @ApiProperty({
    description: 'Option group display name.',
    example: 'Choose noodle type',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional option group description.',
    example: 'Required for all noodle dishes',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Whether this group behaves as an add-on picker or variant selector.',
    enum: ItemOptionGroupKind,
    example: ItemOptionGroupKind.ADD_ON,
  })
  kind!: ItemOptionGroupKind;

  @ApiProperty({
    description: 'Minimum required selections.',
    example: 1,
  })
  minSelect!: number;

  @ApiProperty({
    description: 'Maximum allowed selections.',
    example: 1,
  })
  maxSelect!: number;

  @ApiProperty({
    description: 'Menu-item-local sort order for the option group.',
    example: 0,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the option group is active.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Option group creation timestamp.',
    example: '2026-04-19T09:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Option group last update timestamp.',
    example: '2026-04-19T09:00:00.000Z',
  })
  updatedAt!: string;
}

export function toItemOptionGroupDto(
  group: ItemOptionGroupOwnershipRecord,
): ItemOptionGroupDto {
  return {
    id: group.id,
    branchId: group.menuItem.branch.id,
    menuItemId: group.menuItem.id,
    name: group.name,
    description: group.description,
    kind: group.kind,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}
