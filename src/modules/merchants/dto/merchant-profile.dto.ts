import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MerchantStatus } from '@prisma/client';

import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';

export class MerchantProfileDto {
  @ApiProperty({
    description: 'Merchant identifier.',
    example: 'merchant_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Merchant business display name.',
    example: 'Tea House',
  })
  name!: string;

  @ApiProperty({
    description: 'Primary merchant account phone number.',
    example: '0999999999',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Merchant support phone number.',
    example: '0942000000',
  })
  supportPhone?: string | null;

  @ApiProperty({
    description: 'Primary dynamic store type code for this merchant.',
    example: 'restaurant',
  })
  storeType!: string;

  @ApiProperty({
    description: 'Merchant onboarding or operational status.',
    enum: MerchantStatus,
    example: MerchantStatus.ACTIVE,
  })
  status!: MerchantStatus;

  @ApiProperty({
    description: 'Merchant creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Merchant last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toMerchantProfileDto(
  merchant: MerchantOwnershipRecord,
): MerchantProfileDto {
  return {
    id: merchant.id,
    name: merchant.name,
    phone: merchant.user.phone,
    supportPhone: merchant.supportPhone,
    storeType: merchant.storeType,
    status: merchant.status,
    createdAt: merchant.createdAt.toISOString(),
    updatedAt: merchant.updatedAt.toISOString(),
  };
}
