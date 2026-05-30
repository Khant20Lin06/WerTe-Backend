import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateItemVariantCombinationDto {
  @ApiPropertyOptional({
    description:
      'Optional merchant-facing label. When omitted, a label is generated from the selected option names.',
    example: 'Small / Red / Cotton',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({
    description: 'Optional branch-local SKU for the variant combination.',
    example: 'SKU-TSHIRT-S-RED-COTTON',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  sku?: string;

  @ApiProperty({
    description:
      'Selected option ids that define this combination. Only active VARIANT_SELECTOR options are allowed.',
    example: ['option_size_s', 'option_color_red'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  selectedOptionIds!: string[];

  @ApiPropertyOptional({
    description: 'Whether stock is tracked at the full combination level.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isStockTracked?: boolean;

  @ApiPropertyOptional({
    description: 'Current stock quantity when combination-level stock tracking is enabled.',
    example: 6,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Low-stock threshold when combination-level stock tracking is enabled.',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lowStockThreshold?: number;

  @ApiPropertyOptional({
    description: 'Explicit sort order within the menu item. When omitted, the next slot is assigned automatically.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the combination is active.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
