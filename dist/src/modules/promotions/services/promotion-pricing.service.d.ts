import { Prisma, PromotionDiscountType } from '@prisma/client';
import { AppliedPromotionEntity } from '../entities/applied-promotion.entity';
import { PromotionsRepository } from '../repositories/promotions.repository';
export type PromotionPricingEvaluation = {
    promotionId: string;
    code: string;
    name: string;
    discountType: PromotionDiscountType;
    discountAmount: Prisma.Decimal;
    appliedPromotion: AppliedPromotionEntity;
};
export declare class PromotionPricingService {
    private readonly promotionsRepository;
    constructor(promotionsRepository: PromotionsRepository);
    evaluatePromotionForCheckout(input: {
        branchId: string;
        subtotalAmount: Prisma.Decimal;
        promotionCode?: string;
    }): Promise<PromotionPricingEvaluation | null>;
    normalizePromotionCode(code?: string | null): string | null;
}
