import { PromotionDiscountType } from '@prisma/client';
import { AppliedPromotionEntity } from '../entities/applied-promotion.entity';
export declare class AppliedPromotionDto {
    promotionId: string;
    code: string;
    name: string;
    discountType: PromotionDiscountType;
    discountAmount: string;
}
export declare function toAppliedPromotionDto(promotion?: AppliedPromotionEntity | null): AppliedPromotionDto | null;
