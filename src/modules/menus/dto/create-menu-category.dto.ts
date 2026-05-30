import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMenuCategoryDto {
  @ApiProperty({
    description: 'Category display name.',
    example: 'Popular',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional category description.',
    example: 'Most ordered items',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Explicit branch-local sort order. When omitted, the next slot is assigned automatically.',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the category is active in catalog reads.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Optional approved branch store type identifiers that scope the category. Omit or pass an empty array to keep the category visible for all store types.',
    example: ['store_type_grocery', 'store_type_pharmacy'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(191, { each: true })
  storeTypeIds?: string[];
}
