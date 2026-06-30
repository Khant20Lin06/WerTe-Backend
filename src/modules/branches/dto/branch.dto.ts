import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchStatus, ZoneStatus } from '@prisma/client';

import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';

export type BranchRatingSummary = {
  averageRating: number | null;
  reviewCount: number;
};

export class BranchZoneDto {
  @ApiProperty({
    description: 'Zone identifier assigned to the branch.',
    example: 'zone_1',
  })
  zoneId!: string;

  @ApiProperty({
    description: 'Zone code.',
    example: 'YGN-DT',
  })
  code!: string;

  @ApiProperty({
    description: 'Zone display name.',
    example: 'Downtown',
  })
  name!: string;

  @ApiProperty({
    description: 'Zone status.',
    enum: ZoneStatus,
    example: ZoneStatus.ACTIVE,
  })
  status!: ZoneStatus;
}

export class BranchDto {
  @ApiProperty({
    description: 'Branch identifier.',
    example: 'branch_1',
  })
  id!: string;

  @ApiProperty({
    description: 'Parent merchant identifier.',
    example: 'merchant_1',
  })
  merchantId!: string;

  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Branch contact phone number.',
    example: '0942000000',
  })
  contactPhone?: string | null;

  @ApiPropertyOptional({
    description: 'Primary address line for the branch.',
    example: 'No. 10, Merchant Street',
  })
  line1?: string | null;

  @ApiProperty({
    description: 'Branch township.',
    example: 'Botahtaung',
  })
  township!: string;

  @ApiPropertyOptional({
    description: 'Branch latitude serialized as string when available.',
    example: '16.7792',
  })
  latitude?: string | null;

  @ApiPropertyOptional({
    description: 'Branch longitude serialized as string when available.',
    example: '96.1735',
  })
  longitude?: string | null;

  @ApiProperty({
    description: 'Dynamic store type code used by this branch.',
    example: 'restaurant',
  })
  storeType!: string;

  @ApiProperty({
    description: 'Branch operational status.',
    enum: BranchStatus,
    example: BranchStatus.ACTIVE,
  })
  status!: BranchStatus;

  @ApiProperty({
    description: 'Zones assigned to the branch.',
    type: BranchZoneDto,
    isArray: true,
  })
  zones!: BranchZoneDto[];

  @ApiPropertyOptional({
    description:
      'Weekly operating hours keyed by lowercase weekday (mon–sun).',
    example: {
      mon: { open: true, openTime: '09:00', closeTime: '22:00' },
      sun: { open: false },
    },
  })
  operatingHours?: Record<
    string,
    { open: boolean; openTime?: string; closeTime?: string }
  > | null;

  @ApiProperty({
    description: 'Branch creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Branch last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;

  @ApiPropertyOptional({
    description: 'Average customer rating score for the branch (1-5). Null when no ratings exist.',
    example: 4.5,
    nullable: true,
  })
  averageRating!: number | null;

  @ApiProperty({
    description: 'Total number of ratings submitted for the branch.',
    example: 12,
  })
  reviewCount!: number;
}

export function toBranchDto(
  branch: BranchOwnershipRecord,
  rating?: BranchRatingSummary,
): BranchDto {
  return {
    id: branch.id,
    merchantId: branch.merchant.id,
    name: branch.name,
    contactPhone: branch.contactPhone,
    line1: branch.line1,
    township: branch.township,
    latitude: branch.latitude?.toString() ?? null,
    longitude: branch.longitude?.toString() ?? null,
    storeType: branch.storeType,
    status: branch.status,
    operatingHours: branch.operatingHours as Record<
      string,
      { open: boolean; openTime?: string; closeTime?: string }
    > | null,
    zones: branch.branchZones.map((branchZone) => ({
      zoneId: branchZone.zone.id,
      code: branchZone.zone.code,
      name: branchZone.zone.name,
      status: branchZone.zone.status,
    })),
    createdAt: new Date(branch.createdAt).toISOString(),
    updatedAt: new Date(branch.updatedAt).toISOString(),
    averageRating: rating?.averageRating ?? null,
    reviewCount: rating?.reviewCount ?? 0,
  };
}
