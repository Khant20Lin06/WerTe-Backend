import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStoreTypeDto {
  @ApiProperty({
    description: 'Short unique store type code.',
    example: 'pharmacy',
    maxLength: 80,
  })
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9][a-z0-9_-]*$/)
  code!: string;

  @ApiProperty({
    description: 'Human-readable store type name.',
    example: 'Pharmacy',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional store type description.',
    example: 'Health and wellness storefronts.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Optional store type icon url.',
    example: 'https://cdn.example.com/icons/pharmacy.svg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the store type should be active immediately.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Presentation sort order.',
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
