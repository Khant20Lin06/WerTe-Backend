import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
    maxLength: 160,
  })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    description: 'Branch contact phone number.',
    example: '0942000000',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Primary branch address line.',
    example: 'No. 10, Merchant Street',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line1?: string;

  @ApiProperty({
    description: 'Branch township.',
    example: 'Botahtaung',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  township!: string;

  @ApiPropertyOptional({
    description: 'Branch latitude coordinate.',
    example: 16.7792,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Branch longitude coordinate.',
    example: 96.1735,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description:
      'Dynamic store type code for this branch. Defaults to the merchant store type when omitted.',
    example: 'restaurant',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeType?: string;

  @ApiPropertyOptional({
    description: 'Branch operational status.',
    enum: BranchStatus,
    example: BranchStatus.INACTIVE,
  })
  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;

  @ApiPropertyOptional({
    description: 'Zone identifiers assigned to this branch.',
    example: ['zone_1', 'zone_2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  zoneIds?: string[];
}
