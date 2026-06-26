import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CheckoutContextEntity } from '../entities/checkout-context.entity';
import {
  buildCheckoutPreview,
  CheckoutPreviewEntity,
} from '../entities/checkout-preview.entity';
import { AppliedPromotionEntity } from '../../promotions/entities/applied-promotion.entity';
import { PromotionPricingService } from '../../promotions/services/promotion-pricing.service';

export type CheckoutPricingBreakdown = {
  subtotalAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  deliveryFee: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  appliedPromotion?: AppliedPromotionEntity | null;
};

@Injectable()
export class CheckoutPricingService {
  constructor(
    private readonly promotionPricingService: PromotionPricingService,
  ) {}

  async buildPricingBreakdown(
    context: CheckoutContextEntity,
    options?: {
      promotionCode?: string;
    },
  ): Promise<CheckoutPricingBreakdown> {
    const subtotalAmount = new Prisma.Decimal(context.cart.subtotalAmount);
    const promotionApplication =
      await this.promotionPricingService.evaluatePromotionForCheckout({
        branchId: context.branch.branchId,
        subtotalAmount,
        promotionCode: options?.promotionCode,
        customerProfileId: context.customer.customerProfileId,
      });
    const discountAmount =
      promotionApplication?.discountAmount ?? new Prisma.Decimal(0);
    // PICKUP orders have zero delivery fee; DELIVERY uses fixed fee until zone-based pricing is implemented
    const isPickup = context.address === null;
    const deliveryFeeWaived = promotionApplication?.deliveryFeeWaived === true;
    const deliveryFee =
      isPickup || deliveryFeeWaived ? new Prisma.Decimal(0) : new Prisma.Decimal(1500);
    const totalAmount = subtotalAmount.sub(discountAmount).add(deliveryFee);

    return {
      subtotalAmount,
      discountAmount,
      deliveryFee,
      totalAmount,
      appliedPromotion: promotionApplication?.appliedPromotion ?? null,
    };
  }

  async buildCheckoutPreview(
    context: CheckoutContextEntity,
    options?: {
      promotionCode?: string;
    },
  ): Promise<CheckoutPreviewEntity> {
    const pricing = await this.buildPricingBreakdown(context, options);

    return buildCheckoutPreview({
      context,
      ...pricing,
    });
  }
}
