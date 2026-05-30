import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Customer-facing address label.',
    example: 'Home',
    maxLength: 80,
  })
  @IsString()
  @MaxLength(80)
  label!: string;

  @ApiProperty({
    description: 'Primary address line.',
    example: 'No. 1, Main Road',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  line1!: string;

  @ApiPropertyOptional({
    description: 'Secondary address line.',
    example: 'Apartment 5B',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiPropertyOptional({
    description: 'Nearby landmark.',
    example: 'Near City Mart',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  landmark?: string;

  @ApiProperty({
    description: 'Township for delivery routing.',
    example: 'Thingangyun',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  township!: string;

  @ApiPropertyOptional({
    description: 'City name.',
    example: 'Yangon',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({
    description: 'Postal code.',
    example: '11071',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Additional delivery instructions.',
    example: 'Call when arriving at the gate.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryInstructions?: string;

  @ApiProperty({
    description: 'Latitude coordinate.',
    example: 16.834,
  })
  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude coordinate.',
    example: 96.176,
  })
  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({
    description:
      'Marks the address as the default. The first address becomes default automatically.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}
