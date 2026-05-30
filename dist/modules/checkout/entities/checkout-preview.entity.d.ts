import { Prisma } from '@prisma/client';
import { CheckoutContextAddressEntity, CheckoutContextBranchEntity, CheckoutContextCustomerEntity, CheckoutContextEntity } from './checkout-context.entity';
import { CartAggregateEntity } from '../../carts/entities/cart-aggregate.entity';
export declare class CheckoutPreviewPricingEntity {
    currencyCode: string;
    subtotalAmount: string;
    discountAmount: string;
    deliveryFee: string;
    totalAmount: string;
}
export declare class CheckoutPreviewEntity {
    currencyCode: string;
    customer: CheckoutContextCustomerEntity;
    address: CheckoutContextAddressEntity;
    branch: CheckoutContextBranchEntity;
    cart: CartAggregateEntity;
    pricing: CheckoutPreviewPricingEntity;
}
type BuildCheckoutPreviewInput = {
    context: CheckoutContextEntity;
    subtotalAmount: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    deliveryFee: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
};
export declare function buildCheckoutPreview(input: BuildCheckoutPreviewInput): CheckoutPreviewEntity;
export {};
