import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuScopedStoreTypeDto } from './menu-scoped-store-type.dto';

export class MenuCategoryDto {
  @ApiProperty({
    description: 'Menu category identifier.',
    example: 'cat_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Branch identifier that owns the category.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Category display name.',
    example: 'Popular',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional category description.',
    example: 'Most ordered items',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Category ordering value within the branch catalog.',
    example: 1,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Whether the category is visible in active catalog reads.',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description:
      'Approved store types this category is scoped to. An empty array means the category is visible across all approved store types for the branch.',
    type: MenuScopedStoreTypeDto,
    isArray: true,
  })
  storeTypes!: MenuScopedStoreTypeDto[];

  @ApiProperty({
    description: 'Category creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Category last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toMenuCategoryDto(
  category: MenuCategoryOwnershipRecord,
): MenuCategoryDto {
  return {
    id: category.id,
    branchId: category.branch.id,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    storeTypes: category.storeTypes.map((assignment) => ({
      id: assignment.storeType.id,
      code: assignment.storeType.code,
      name: assignment.storeType.name,
      sortOrder: assignment.storeType.sortOrder,
    })),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}
