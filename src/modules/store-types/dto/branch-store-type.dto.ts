import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchStatus, BranchStoreTypeStatus, UserRole } from '@prisma/client';

import { BranchStoreTypeManagementRecord } from '../entities/branch-store-type-management.entity';

export class BranchStoreTypeDto {
  @ApiProperty({
    description: 'Branch identifier.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiProperty({
    description: 'Branch display name.',
    example: 'Downtown Branch',
  })
  branchName!: string;

  @ApiProperty({
    description: 'Merchant identifier.',
    example: 'merchant_1',
  })
  merchantId!: string;

  @ApiProperty({
    description: 'Merchant display name.',
    example: 'Tea House',
  })
  merchantName!: string;

  @ApiProperty({
    description: 'Branch operational status.',
    enum: BranchStatus,
    example: BranchStatus.ACTIVE,
  })
  branchStatus!: BranchStatus;

  @ApiProperty({
    description: 'Store type identifier.',
    example: 'store_type_restaurant',
  })
  storeTypeId!: string;

  @ApiProperty({
    description: 'Store type code.',
    example: 'restaurant',
  })
  storeTypeCode!: string;

  @ApiProperty({
    description: 'Store type display name.',
    example: 'Restaurant',
  })
  storeTypeName!: string;

  @ApiProperty({
    description: 'Whether the referenced store type is active globally.',
    example: true,
  })
  storeTypeIsActive!: boolean;

  @ApiProperty({
    description: 'Whether the referenced store type belongs to the seed registry.',
    example: false,
  })
  storeTypeIsSystem!: boolean;

  @ApiProperty({
    description: 'Current admin approval status for this branch store type assignment.',
    enum: BranchStoreTypeStatus,
    example: BranchStoreTypeStatus.APPROVED,
  })
  status!: BranchStoreTypeStatus;

  @ApiProperty({
    description: 'Whether this is the primary approved store type for the branch.',
    example: true,
  })
  isPrimary!: boolean;

  @ApiProperty({
    description: 'Presentation sort order within the branch.',
    example: 0,
  })
  sortOrder!: number;

  @ApiPropertyOptional({
    description: 'User identifier that originated the request.',
    example: 'usr_merchant_1',
  })
  requestedByUserId?: string | null;

  @ApiPropertyOptional({
    description: 'Role of the user that originated the request.',
    enum: UserRole,
    example: UserRole.MERCHANT,
  })
  requestedByUserRole?: UserRole | null;

  @ApiPropertyOptional({
    description: 'User identifier that last approved the assignment.',
    example: 'usr_admin_1',
  })
  approvedByUserId?: string | null;

  @ApiPropertyOptional({
    description: 'Role of the user that last approved the assignment.',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  approvedByUserRole?: UserRole | null;

  @ApiPropertyOptional({
    description: 'Approval timestamp when applicable.',
    example: '2026-04-30T08:00:00.000Z',
  })
  approvedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Rejection timestamp when applicable.',
    example: '2026-04-30T08:00:00.000Z',
  })
  rejectedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Hidden timestamp when applicable.',
    example: '2026-04-30T08:00:00.000Z',
  })
  hiddenAt?: string | null;

  @ApiPropertyOptional({
    description: 'Optional admin note explaining the current status.',
    example: 'Approved for launch week.',
  })
  reason?: string | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2026-04-30T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-04-30T08:00:00.000Z',
  })
  updatedAt!: string;
}

export function toBranchStoreTypeDto(
  assignment: BranchStoreTypeManagementRecord,
): BranchStoreTypeDto {
  return {
    branchId: assignment.branch.id,
    branchName: assignment.branch.name,
    merchantId: assignment.branch.merchant.id,
    merchantName: assignment.branch.merchant.name,
    branchStatus: assignment.branch.status,
    storeTypeId: assignment.storeType.id,
    storeTypeCode: assignment.storeType.code,
    storeTypeName: assignment.storeType.name,
    storeTypeIsActive: assignment.storeType.isActive,
    storeTypeIsSystem: assignment.storeType.isSystem,
    status: assignment.status,
    isPrimary: assignment.isPrimary,
    sortOrder: assignment.sortOrder,
    requestedByUserId: assignment.requestedBy?.id ?? null,
    requestedByUserRole: assignment.requestedBy?.role ?? null,
    approvedByUserId: assignment.approvedBy?.id ?? null,
    approvedByUserRole: assignment.approvedBy?.role ?? null,
    approvedAt: assignment.approvedAt?.toISOString() ?? null,
    rejectedAt: assignment.rejectedAt?.toISOString() ?? null,
    hiddenAt: assignment.hiddenAt?.toISOString() ?? null,
    reason: assignment.reason,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
  };
}
