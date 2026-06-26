import { Prisma } from '@prisma/client';

import {
  CheckoutContextAddressEntity,
  CheckoutContextBranchEntity,
  CheckoutContextCustomerEntity,
  CheckoutContextEntity,
} from './checkout-context.entity';
import { CartAggregateEntity } from '../../carts/entities/cart-aggregate.entity';
import { AppliedPromotionEntity } from '../../promotions/entities/applied-promotion.entity';

export class CheckoutPreviewPricingEntity {
  currencyCode!: string;
  subtotalAmount!: string;
  discountAmount!: string;
  deliveryFee!: string;
  totalAmount!: string;
  appliedPromotion?: AppliedPromotionEntity | null;
}

export class CheckoutPreviewEntity {
  currencyCode!: string;
  customer!: CheckoutContextCustomerEntity;
  address!: CheckoutContextAddressEntity | null;
  branch!: CheckoutContextBranchEntity;
  cart!: CartAggregateEntity;
  pricing!: CheckoutPreviewPricingEntity;
}

type BuildCheckoutPreviewInput = {
  context: CheckoutContextEntity;
  subtotalAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  deliveryFee: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  appliedPromotion?: AppliedPromotionEntity | null;
};

export function buildCheckoutPreview(
  input: BuildCheckoutPreviewInput,
): CheckoutPreviewEntity {
  return {
    currencyCode: input.context.currencyCode,
    customer: input.context.customer,
    address: input.context.address,
    branch: input.context.branch,
    cart: input.context.cart,
    pricing: {
      currencyCode: input.context.currencyCode,
      subtotalAmount: input.subtotalAmount.toString(),
      discountAmount: input.discountAmount.toString(),
      deliveryFee: input.deliveryFee.toString(),
      totalAmount: input.totalAmount.toString(),
      appliedPromotion: input.appliedPromotion ?? null,
    },
  };
}
