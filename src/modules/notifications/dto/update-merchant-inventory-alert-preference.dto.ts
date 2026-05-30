import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

function transformOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

function transformOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length === 0 ? '' : normalized;
}

export class UpdateMerchantInventoryAlertPreferenceDto {
  @ApiPropertyOptional({
    example: true,
    description:
      'When false, merchant inventory alert push deliveries are disabled and in-app remains the only active channel.',
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  inventoryAlertPushEnabled?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'When true, quiet hours are evaluated before queueing merchant inventory alert push deliveries.',
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalBoolean(value))
  @IsBoolean()
  inventoryAlertQuietHoursEnabled?: boolean;

  @ApiPropertyOptional({
    example: '22:00',
    description: 'Quiet-hours local start time in HH:mm format.',
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalString(value))
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  inventoryAlertQuietHoursStartLocalTime?: string;

  @ApiPropertyOptional({
    example: '06:00',
    description: 'Quiet-hours local end time in HH:mm format.',
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalString(value))
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  inventoryAlertQuietHoursEndLocalTime?: string;

  @ApiPropertyOptional({
    example: 'Asia/Bangkok',
    description: 'IANA timezone used to evaluate the quiet-hours local window.',
  })
  @IsOptional()
  @Transform(({ value }) => transformOptionalString(value))
  @IsString()
  inventoryAlertQuietHoursTimezone?: string;
}
