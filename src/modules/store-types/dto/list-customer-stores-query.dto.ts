import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum CustomerStoreSortBy {
  NAME_ASC = 'NAME_ASC',
  NAME_DESC = 'NAME_DESC',
  TOWNSHIP_ASC = 'TOWNSHIP_ASC',
  TOWNSHIP_DESC = 'TOWNSHIP_DESC',
  MERCHANT_NAME_ASC = 'MERCHANT_NAME_ASC',
}

function toOptionalStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const normalizedValues = values
    .flatMap((entry) =>
      typeof entry === 'string' ? entry.split(',') : [],
    )
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return normalizedValues.length > 0 ? normalizedValues : undefined;
}

export class ListCustomerStoresQueryDto {
  @ApiPropertyOptional({
    description: 'Optional dynamic store type code filter.',
    example: 'grocery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeTypeCode?: string;

  @ApiPropertyOptional({
    description:
      'Optional multi-select dynamic store type codes. Accepts repeated query params or comma-separated values.',
    example: ['grocery', 'pharmacy'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => toOptionalStringArray(value))
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  storeTypeCodes?: string[];

  @ApiPropertyOptional({
    description: 'Optional township filter.',
    example: 'Kamaryut',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  township?: string;

  @ApiPropertyOptional({
    description: 'Optional keyword filter applied to branch, merchant, and township names.',
    example: 'city mart',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Optional merchant identifier filter.',
    example: 'merchant_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  merchantId?: string;

  @ApiPropertyOptional({
    description: 'Optional branch identifier filter.',
    example: 'branch_1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Optional discovery sort mode.',
    enum: CustomerStoreSortBy,
    example: CustomerStoreSortBy.NAME_ASC,
  })
  @IsOptional()
  @IsEnum(CustomerStoreSortBy)
  sortBy?: CustomerStoreSortBy;
}
