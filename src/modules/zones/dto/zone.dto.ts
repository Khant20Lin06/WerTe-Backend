import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ZoneStatus } from '@prisma/client';

import { ZoneManagementRecord } from '../entities/zone-management.entity';
import { ZoneReadRecord } from '../entities/zone-read.entity';

type ZoneDtoSource = ZoneReadRecord | ZoneManagementRecord;

export class ZoneDto {
  @ApiProperty({
    description: 'Zone identifier.',
    example: 'zone_1',
  })
  id!: string;

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

  @ApiPropertyOptional({
    description: 'Optional zone description.',
    example: 'Central Yangon delivery zone',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Zone status.',
    enum: ZoneStatus,
    example: ZoneStatus.ACTIVE,
  })
  status!: ZoneStatus;

  @ApiPropertyOptional({
    description: 'Number of branches currently mapped to the zone.',
    example: 3,
  })
  branchCount?: number;

  @ApiProperty({
    description: 'Zone creation timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Zone last update timestamp.',
    example: '2026-04-19T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toZoneDto(zone: ZoneDtoSource): ZoneDto {
  return {
    id: zone.id,
    code: zone.code,
    name: zone.name,
    description: zone.description,
    status: zone.status,
    branchCount: '_count' in zone ? zone._count.branchZones : undefined,
    createdAt: zone.createdAt.toISOString(),
    updatedAt: zone.updatedAt.toISOString(),
  };
}
