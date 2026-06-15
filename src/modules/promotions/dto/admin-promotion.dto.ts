import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionDiscountType } from '@prisma/client';

import { PromotionWithCount } from '../repositories/promotions.repository';

export class AdminPromotionDto {
  @ApiProperty({ example: 'promo_1' })
  promotionId!: string;

  @ApiProperty({ example: 'branch_1' })
  branchId!: string;

  @ApiPropertyOptional({ example: 'Mama Kitchen — Main Branch' })
  branchName!: string | null;

  @ApiPropertyOptional({ example: 'Mama Kitchen' })
  merchantName!: string | null;

  @ApiProperty({ example: 'SAVE10' })
  code!: string;

  @ApiProperty({ example: 'Save 10 percent' })
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty({ enum: PromotionDiscountType })
  discountType!: PromotionDiscountType;

  @ApiProperty({ example: '10' })
  discountValue!: string;

  @ApiProperty({ example: '5000' })
  minimumSubtotalAmount!: string;

  @ApiPropertyOptional({ example: '2500' })
  maximumDiscountAmount!: string | null;

  @ApiPropertyOptional({ example: '2026-05-03T00:00:00.000Z' })
  startsAt!: string | null;

  @ApiPropertyOptional({ example: '2026-05-31T23:59:59.000Z' })
  endsAt!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 42, description: 'Number of orders that used this promotion' })
  usageCount!: number;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  updatedAt!: string;
}

type BranchWithMerchant = {
  name: string;
  merchant: { name: string } | null;
} | null;

export function toAdminPromotionDto(
  record: PromotionWithCount,
  branch?: BranchWithMerchant,
): AdminPromotionDto {
  return {
    promotionId: record.id,
    branchId: record.branchId,
    branchName: branch?.name ?? null,
    merchantName: branch?.merchant?.name ?? null,
    code: record.code,
    name: record.name,
    description: record.description,
    discountType: record.discountType,
    discountValue: record.discountValue.toString(),
    minimumSubtotalAmount: record.minimumSubtotalAmount.toString(),
    maximumDiscountAmount: record.maximumDiscountAmount?.toString() ?? null,
    startsAt: record.startsAt?.toISOString() ?? null,
    endsAt: record.endsAt?.toISOString() ?? null,
    isActive: record.isActive,
    usageCount: record._count.orders,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
