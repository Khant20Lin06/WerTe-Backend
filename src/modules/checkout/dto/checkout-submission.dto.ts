import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CheckoutSubmissionEntity } from '../entities/checkout-submission.entity';
import { CheckoutPaymentIntentEntity } from '../../payments/entities/checkout-payment-intent.entity';
import {
  AppliedPromotionDto,
  toAppliedPromotionDto,
} from '../../promotions/dto/applied-promotion.dto';

export class CheckoutPaymentIntentDto {
  @ApiProperty({
    description: 'Created payment intent identifier.',
    example: 'payment_1',
  })
  paymentId!: string;

  @ApiProperty({
    description: 'Order identifier associated with the payment intent.',
    example: 'order_1',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Customer profile identifier associated with the payment intent.',
    example: 'cust_prof_1',
  })
  customerProfileId!: string;

  @ApiProperty({
    description: 'Checkout payment method.',
    example: 'CASH_ON_DELIVERY',
  })
  method!: string;

  @ApiProperty({
    description: 'Resolved payment provider.',
    example: 'COD',
  })
  provider!: string;

  @ApiProperty({
    description: 'Current payment intent status.',
    example: 'PENDING',
  })
  status!: string;

  @ApiProperty({
    description: 'Payment amount serialized as a string.',
    example: '6500',
  })
  amount!: string;

  @ApiProperty({
    description: 'Payment currency code.',
    example: 'MMK',
  })
  currencyCode!: string;

  @ApiPropertyOptional({
    description: 'Client-generated idempotency key reused for the payment intent.',
    example: 'checkout-usr_1-001',
  })
  idempotencyKey!: string | null;

  @ApiPropertyOptional({
    description: 'Provider reference when available.',
    example: 'pi_123',
  })
  providerReference!: string | null;

  @ApiPropertyOptional({
    description: 'Provider receipt identifier when available.',
    example: 'receipt_123',
  })
  providerReceiptId!: string | null;

  @ApiPropertyOptional({
    description: 'Failure code when the payment intent is in a failed state.',
    example: 'provider_timeout',
  })
  failureCode!: string | null;

  @ApiPropertyOptional({
    description: 'Failure message when the payment intent is in a failed state.',
    example: 'Provider timeout',
  })
  failureMessage!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp indicating when customer action became required.',
    example: '2026-04-24T10:00:00.000Z',
  })
  requiresActionAt!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp for successful payment capture.',
    example: '2026-04-24T10:05:00.000Z',
  })
  succeededAt!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp for failed payment processing.',
    example: '2026-04-24T10:05:00.000Z',
  })
  failedAt!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp for cancelled payment intents.',
    example: '2026-04-24T10:05:00.000Z',
  })
  cancelledAt!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp for expired payment intents.',
    example: '2026-04-24T10:05:00.000Z',
  })
  expiredAt!: string | null;

  @ApiProperty({
    description: 'Whether the current payment intent requires a customer-side action.',
    example: false,
  })
  requiresCustomerAction!: boolean;

  @ApiProperty({
    description: 'ISO timestamp for payment intent creation.',
    example: '2026-04-24T10:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'ISO timestamp for payment intent update.',
    example: '2026-04-24T10:00:00.000Z',
  })
  updatedAt!: string;
}

export class CheckoutSubmissionDto {
  @ApiProperty({
    description: 'Created order identifier.',
    example: 'order_1',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Customer-facing order code.',
    example: 'ORD-00000001',
  })
  orderCode!: string;

  @ApiProperty({
    description: 'Customer profile identifier.',
    example: 'cust_prof_1',
  })
  customerProfileId!: string;

  @ApiProperty({
    description: 'Branch identifier that received the order.',
    example: 'branch_1',
  })
  branchId!: string;

  @ApiPropertyOptional({
    description: 'Delivery address identifier used for the order.',
    example: 'addr_1',
  })
  addressId!: string | null;

  @ApiPropertyOptional({
    description: 'Source cart identifier used for checkout.',
    example: 'cart_1',
  })
  cartId!: string | null;

  @ApiPropertyOptional({
    description: 'Client-generated idempotency key for the checkout request.',
    example: 'checkout-usr_1-001',
  })
  idempotencyKey!: string | null;

  @ApiProperty({
    description: 'Initial order status.',
    example: 'PLACED',
  })
  status!: string;

  @ApiProperty({
    description: 'Currency code for the order totals.',
    example: 'MMK',
  })
  currencyCode!: string;

  @ApiPropertyOptional({
    description: 'Applied promotion summary when a promotion discounted the order.',
    type: () => AppliedPromotionDto,
  })
  appliedPromotion?: AppliedPromotionDto | null;

  @ApiProperty({
    description: 'Subtotal amount serialized as a string.',
    example: '6500',
  })
  subtotalAmount!: string;

  @ApiProperty({
    description: 'Discount amount serialized as a string.',
    example: '0',
  })
  discountAmount!: string;

  @ApiProperty({
    description: 'Delivery fee serialized as a string.',
    example: '0',
  })
  deliveryFee!: string;

  @ApiProperty({
    description: 'Final total amount serialized as a string.',
    example: '6500',
  })
  totalAmount!: string;

  @ApiProperty({
    description: 'ISO timestamp for order placement.',
    example: '2026-04-19T10:00:00.000Z',
  })
  placedAt!: string;

  @ApiProperty({
    description:
      'Whether this response came from an idempotent replay instead of a new order creation.',
    example: false,
  })
  isIdempotentReplay!: boolean;

  @ApiProperty({
    description: 'Payment intent created or replayed for the submitted checkout.',
    type: () => CheckoutPaymentIntentDto,
  })
  paymentIntent!: CheckoutPaymentIntentDto;
}

function toCheckoutPaymentIntentDto(
  paymentIntent: CheckoutPaymentIntentEntity,
): CheckoutPaymentIntentDto {
  return {
    paymentId: paymentIntent.paymentId,
    orderId: paymentIntent.orderId,
    customerProfileId: paymentIntent.customerProfileId,
    method: paymentIntent.method,
    provider: paymentIntent.provider,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currencyCode: paymentIntent.currencyCode,
    idempotencyKey: paymentIntent.idempotencyKey,
    providerReference: paymentIntent.providerReference,
    providerReceiptId: paymentIntent.providerReceiptId,
    failureCode: paymentIntent.failureCode,
    failureMessage: paymentIntent.failureMessage,
    requiresActionAt: paymentIntent.requiresActionAt,
    succeededAt: paymentIntent.succeededAt,
    failedAt: paymentIntent.failedAt,
    cancelledAt: paymentIntent.cancelledAt,
    expiredAt: paymentIntent.expiredAt,
    requiresCustomerAction: paymentIntent.requiresCustomerAction,
    createdAt: paymentIntent.createdAt,
    updatedAt: paymentIntent.updatedAt,
  };
}

export function toCheckoutSubmissionDto(
  submission: CheckoutSubmissionEntity,
): CheckoutSubmissionDto {
  return {
    orderId: submission.orderId,
    orderCode: submission.orderCode,
    customerProfileId: submission.customerProfileId,
    branchId: submission.branchId,
    addressId: submission.addressId,
    cartId: submission.cartId,
    idempotencyKey: submission.idempotencyKey,
    status: submission.status,
    currencyCode: submission.currencyCode,
    appliedPromotion: toAppliedPromotionDto(submission.appliedPromotion),
    subtotalAmount: submission.subtotalAmount,
    discountAmount: submission.discountAmount,
    deliveryFee: submission.deliveryFee,
    totalAmount: submission.totalAmount,
    placedAt: submission.placedAt,
    isIdempotentReplay: submission.isIdempotentReplay,
    paymentIntent: toCheckoutPaymentIntentDto(submission.paymentIntent),
  };
}
