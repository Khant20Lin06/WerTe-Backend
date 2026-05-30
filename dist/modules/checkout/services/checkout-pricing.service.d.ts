import { Prisma } from '@prisma/client';
import { CheckoutContextEntity } from '../entities/checkout-context.entity';
import { CheckoutPreviewEntity } from '../entities/checkout-preview.entity';
export type CheckoutPricingBreakdown = {
    subtotalAmount: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    deliveryFee: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
};
export declare class CheckoutPricingService {
    buildPricingBreakdown(context: CheckoutContextEntity): CheckoutPricingBreakdown;
    buildCheckoutPreview(context: CheckoutContextEntity): CheckoutPreviewEntity;
}
