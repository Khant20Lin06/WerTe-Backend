import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateItemOptionDto {
  @ApiProperty({
    description: 'Option display name.',
    example: 'Thin rice noodle',
    maxLength: 160,
  })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({
    description: 'Price delta applied when this option is selected.',
    example: 0,
  })
  @Type(() => Number)
  @IsNumber()
  priceDelta!: number;

  @ApiPropertyOptional({
    description: 'Explicit sort order within the option group. When omitted, the next slot is assigned automatically.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the option is active.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether stock is tracked for this option-level variant or add-on.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isStockTracked?: boolean;

  @ApiPropertyOptional({
    description: 'Current stock quantity when option-level stock tracking is enabled.',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Low-stock threshold when option-level stock tracking is enabled.',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lowStockThreshold?: number;
}
