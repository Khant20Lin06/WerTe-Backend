import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionDiscountType } from '@prisma/client';

import { PromotionEntity } from '../entities/promotion.entity';

export class PromotionDto {
  @ApiProperty({ example: 'promo_1' })
  promotionId!: string;

  @ApiProperty({ example: 'branch_1' })
  branchId!: string;

  @ApiProperty({ example: 'SAVE10' })
  code!: string;

  @ApiProperty({ example: 'Save 10 percent' })
  name!: string;

  @ApiPropertyOptional({ example: 'Weekend promo for grocery orders.' })
  description!: string | null;

  @ApiProperty({
    enum: PromotionDiscountType,
    example: PromotionDiscountType.PERCENTAGE,
  })
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

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  updatedAt!: string;
}

export function toPromotionDto(promotion: PromotionEntity): PromotionDto {
  return {
    promotionId: promotion.promotionId,
    branchId: promotion.branchId,
    code: promotion.code,
    name: promotion.name,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    minimumSubtotalAmount: promotion.minimumSubtotalAmount,
    maximumDiscountAmount: promotion.maximumDiscountAmount,
    startsAt: promotion.startsAt,
    endsAt: promotion.endsAt,
    isActive: promotion.isActive,
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
  };
}
