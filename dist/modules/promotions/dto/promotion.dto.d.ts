import { PromotionDiscountType } from '@prisma/client';
import { PromotionEntity } from '../entities/promotion.entity';
export declare class PromotionDto {
    promotionId: string;
    branchId: string;
    code: string;
    name: string;
    description: string | null;
    discountType: PromotionDiscountType;
    discountValue: string;
    minimumSubtotalAmount: string;
    maximumDiscountAmount: string | null;
    perCustomerLimit: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare function toPromotionDto(promotion: PromotionEntity): PromotionDto;
