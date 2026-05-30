import { ApiProperty } from '@nestjs/swagger';
import { PromotionDiscountType } from '@prisma/client';

import { AppliedPromotionEntity } from '../entities/applied-promotion.entity';

export class AppliedPromotionDto {
  @ApiProperty({ example: 'promo_1' })
  promotionId!: string;

  @ApiProperty({ example: 'SAVE10' })
  code!: string;

  @ApiProperty({ example: 'Save 10 percent' })
  name!: string;

  @ApiProperty({
    enum: PromotionDiscountType,
    example: PromotionDiscountType.PERCENTAGE,
  })
  discountType!: PromotionDiscountType;

  @ApiProperty({ example: '650' })
  discountAmount!: string;
}

export function toAppliedPromotionDto(
  promotion?: AppliedPromotionEntity | null,
): AppliedPromotionDto | null {
  if (promotion === undefined || promotion === null) {
    return null;
  }

  return {
    promotionId: promotion.promotionId,
    code: promotion.code,
    name: promotion.name,
    discountType: promotion.discountType,
    discountAmount: promotion.discountAmount,
  };
}
