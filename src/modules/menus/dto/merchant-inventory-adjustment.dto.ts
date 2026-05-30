import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditResourceType, Prisma, UserRole } from '@prisma/client';

import { AuditLogEntity } from '../../audit/entities/audit-log.entity';

export class MerchantInventoryAdjustmentActorDto {
  @ApiProperty({
    description: 'Actor user identifier.',
    example: 'usr_merchant_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Actor role for the inventory adjustment.',
    enum: UserRole,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Actor phone number.',
    example: '0999999999',
  })
  phone!: string;
}

export class MerchantInventoryAdjustmentDto {
  @ApiProperty({
    description: 'Audit log identifier for the adjustment event.',
    example: 'audit_1',
  })
  auditLogId!: string;

  @ApiProperty({
    description: 'Adjusted resource type.',
    enum: AuditResourceType,
  })
  resourceType!: AuditResourceType;

  @ApiProperty({
    description: 'Adjusted resource identifier.',
    example: 'item_1',
  })
  resourceId!: string;

  @ApiPropertyOptional({
    description: 'Adjusted resource display label.',
    example: 'Mohinga',
  })
  resourceLabel!: string | null;

  @ApiProperty({
    description: 'Signed inventory delta that was applied.',
    example: -2,
  })
  delta!: number;

  @ApiProperty({
    description: 'Structured reason code recorded for the adjustment.',
    example: 'manual_writeoff_damaged_stock',
  })
  reasonCode!: string | null;

  @ApiPropertyOptional({
    description: 'Optional adjustment note.',
    example: 'Two damaged units were removed from inventory.',
  })
  note!: string | null;

  @ApiPropertyOptional({
    description: 'Stock quantity before the adjustment.',
    example: 10,
  })
  beforeStockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Stock quantity after the adjustment.',
    example: 8,
  })
  afterStockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Low-stock threshold at the time of adjustment.',
    example: 3,
  })
  lowStockThreshold!: number | null;

  @ApiPropertyOptional({
    description: 'Actor summary when available.',
    type: MerchantInventoryAdjustmentActorDto,
  })
  actor!: MerchantInventoryAdjustmentActorDto | null;

  @ApiProperty({
    description: 'Adjustment timestamp.',
    example: '2026-05-01T10:00:00.000Z',
  })
  createdAt!: string;
}

export function toMerchantInventoryAdjustmentDto(
  auditLog: AuditLogEntity,
): MerchantInventoryAdjustmentDto {
  const metadata = toMetadataRecord(auditLog.metadata);

  return {
    auditLogId: auditLog.auditLogId,
    resourceType: auditLog.resourceType,
    resourceId: auditLog.resourceId,
    resourceLabel: auditLog.resourceLabel,
    delta: readMetadataNumber(metadata, 'delta') ?? 0,
    reasonCode: readMetadataString(metadata, 'reasonCode'),
    note: readMetadataString(metadata, 'note'),
    beforeStockQuantity: readMetadataNumber(metadata, 'beforeStockQuantity'),
    afterStockQuantity: readMetadataNumber(metadata, 'afterStockQuantity'),
    lowStockThreshold: readMetadataNumber(metadata, 'lowStockThreshold'),
    actor:
      auditLog.actorUser === null
        ? null
        : {
            userId: auditLog.actorUser.userId,
            role: auditLog.actorUser.role,
            phone: auditLog.actorUser.phone,
          },
    createdAt: auditLog.createdAt,
  };
}

function toMetadataRecord(
  value: Prisma.JsonValue | null,
): Record<string, Prisma.JsonValue> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, Prisma.JsonValue>;
}

function readMetadataString(
  metadata: Record<string, Prisma.JsonValue> | null,
  key: string,
): string | null {
  if (metadata === null) {
    return null;
  }

  const value = metadata[key];

  return typeof value === 'string' ? value : null;
}

function readMetadataNumber(
  metadata: Record<string, Prisma.JsonValue> | null,
  key: string,
): number | null {
  if (metadata === null) {
    return null;
  }

  const value = metadata[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
