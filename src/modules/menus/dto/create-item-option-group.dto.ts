import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemOptionGroupKind } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateItemOptionGroupDto {
  @ApiProperty({
    description: 'Option group display name.',
    example: 'Choose noodle type',
    maxLength: 160,
  })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional option group description.',
    example: 'Required for all noodle dishes',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description:
      'Group behavior. Use VARIANT_SELECTOR for size, shade, pack size, or similar sellable variants.',
    enum: ItemOptionGroupKind,
    example: ItemOptionGroupKind.VARIANT_SELECTOR,
  })
  @IsOptional()
  @IsEnum(ItemOptionGroupKind)
  kind?: ItemOptionGroupKind;

  @ApiProperty({
    description: 'Minimum required selections.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSelect!: number;

  @ApiProperty({
    description: 'Maximum allowed selections.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxSelect!: number;

  @ApiPropertyOptional({
    description: 'Explicit sort order within the menu item. When omitted, the next slot is assigned automatically.',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the option group is active.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
