import { Prisma } from '@prisma/client';
import { CheckoutContextEntity } from '../entities/checkout-context.entity';
import { CheckoutPreviewEntity } from '../entities/checkout-preview.entity';
import { AppliedPromotionEntity } from '../../promotions/entities/applied-promotion.entity';
import { PromotionPricingService } from '../../promotions/services/promotion-pricing.service';
export type CheckoutPricingBreakdown = {
    subtotalAmount: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    deliveryFee: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    appliedPromotion?: AppliedPromotionEntity | null;
};
export declare class CheckoutPricingService {
    private readonly promotionPricingService;
    constructor(promotionPricingService: PromotionPricingService);
    buildPricingBreakdown(context: CheckoutContextEntity, options?: {
        promotionCode?: string;
    }): Promise<CheckoutPricingBreakdown>;
    buildCheckoutPreview(context: CheckoutContextEntity, options?: {
        promotionCode?: string;
    }): Promise<CheckoutPreviewEntity>;
}
