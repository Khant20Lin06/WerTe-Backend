import { OrderStatus, Prisma } from '@prisma/client';

import { CheckoutPaymentIntentEntity } from '../../payments/entities/checkout-payment-intent.entity';
import {
  AppliedPromotionEntity,
  buildAppliedPromotionEntityFromSnapshot,
} from '../../promotions/entities/applied-promotion.entity';

export const checkoutSubmissionSelect = Prisma.validator<Prisma.OrderSelect>()({
  id: true,
  orderCode: true,
  customerProfileId: true,
  branchId: true,
  addressId: true,
  cartId: true,
  idempotencyKey: true,
  promotionId: true,
  promotionCodeSnapshot: true,
  promotionNameSnapshot: true,
  promotionDiscountTypeSnapshot: true,
  status: true,
  currencyCode: true,
  subtotalAmount: true,
  discountAmount: true,
  deliveryFee: true,
  totalAmount: true,
  placedAt: true,
});

export type CheckoutSubmissionRecord = Prisma.OrderGetPayload<{
  select: typeof checkoutSubmissionSelect;
}>;

export class CheckoutSubmissionEntity {
  orderId!: string;
  orderCode!: string;
  customerProfileId!: string;
  branchId!: string;
  addressId!: string | null;
  cartId!: string | null;
  idempotencyKey!: string | null;
  status!: OrderStatus;
  currencyCode!: string;
  appliedPromotion?: AppliedPromotionEntity | null;
  subtotalAmount!: string;
  discountAmount!: string;
  deliveryFee!: string;
  totalAmount!: string;
  placedAt!: string;
  isIdempotentReplay!: boolean;
  paymentIntent!: CheckoutPaymentIntentEntity;
}

export function buildCheckoutSubmission(
  order: CheckoutSubmissionRecord,
  options?: {
    isIdempotentReplay?: boolean;
    paymentIntent?: CheckoutPaymentIntentEntity;
  },
): CheckoutSubmissionEntity {
  return {
    orderId: order.id,
    orderCode: order.orderCode,
    customerProfileId: order.customerProfileId,
    branchId: order.branchId,
    addressId: order.addressId,
    cartId: order.cartId,
    idempotencyKey: order.idempotencyKey,
    status: order.status,
    currencyCode: order.currencyCode,
    appliedPromotion: buildAppliedPromotionEntityFromSnapshot({
      promotionId: order.promotionId,
      promotionCodeSnapshot: order.promotionCodeSnapshot,
      promotionNameSnapshot: order.promotionNameSnapshot,
      promotionDiscountTypeSnapshot: order.promotionDiscountTypeSnapshot,
      discountAmount: order.discountAmount,
    }),
    subtotalAmount: order.subtotalAmount.toString(),
    discountAmount: order.discountAmount.toString(),
    deliveryFee: order.deliveryFee.toString(),
    totalAmount: order.totalAmount.toString(),
    placedAt: order.placedAt.toISOString(),
    isIdempotentReplay: options?.isIdempotentReplay ?? false,
    paymentIntent: options?.paymentIntent!,
  };
}
