import {
  BranchStatus,
  CartStatus,
  MerchantStatus,
  Prisma,
  PromotionDiscountType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { CheckoutContextEntity } from '../../../../src/modules/checkout/entities/checkout-context.entity';
import { CheckoutPricingService } from '../../../../src/modules/checkout/services/checkout-pricing.service';
import { PromotionPricingService } from '../../../../src/modules/promotions/services/promotion-pricing.service';

function makeCheckoutContext(
  overrides?: Partial<CheckoutContextEntity>,
): CheckoutContextEntity {
  return {
    currencyCode: 'MMK',
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      userStatus: UserStatus.ACTIVE,
      fullName: 'Mg Mg',
      avatarUrl: null,
    },
    address: {
      addressId: 'addr_1',
      label: 'Home',
      line1: 'No. 1, Main Road',
      line2: null,
      landmark: null,
      township: 'Botahtaung',
      city: 'Yangon',
      postalCode: null,
      deliveryInstructions: 'Call before arrival',
      latitude: '16.834',
      longitude: '96.176',
      isDefault: true,
    },
    branch: {
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      merchantUserId: 'usr_merchant_1',
      merchantName: 'Merchant One',
      merchantStatus: MerchantStatus.ACTIVE,
      branchName: 'Downtown Branch',
      township: 'Botahtaung',
      branchStatus: BranchStatus.ACTIVE,
    },
    cart: {
      cartId: 'cart_1',
      customerProfileId: 'cust_prof_1',
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      branchName: 'Downtown Branch',
      branchStatus: BranchStatus.ACTIVE,
      merchantStatus: MerchantStatus.ACTIVE,
      status: CartStatus.ACTIVE,
      totalQuantity: 2,
      subtotalAmount: '6500',
      totalAmount: '6500',
      isEmpty: false,
      items: [],
    },
    ...overrides,
  };
}

describe('CheckoutPricingService', () => {
  const makePromotionPricingService = () =>
    ({
      evaluatePromotionForCheckout: jest.fn().mockResolvedValue(null),
    }) as unknown as jest.Mocked<PromotionPricingService>;

  it('builds a preview pricing breakdown from the validated checkout context', async () => {
    const service = new CheckoutPricingService(makePromotionPricingService());

    const result = await service.buildPricingBreakdown(makeCheckoutContext());

    expect(result.subtotalAmount.toString()).toBe('6500');
    expect(result.discountAmount.toString()).toBe('0');
    expect(result.deliveryFee.toString()).toBe('0');
    expect(result.totalAmount.toString()).toBe('6500');
  });

  it('builds a checkout preview aggregate with nested context and serialized totals', async () => {
    const service = new CheckoutPricingService(makePromotionPricingService());

    const result = await service.buildCheckoutPreview(makeCheckoutContext());

    expect(result).toMatchObject({
      currencyCode: 'MMK',
      customer: {
        customerProfileId: 'cust_prof_1',
      },
      address: {
        addressId: 'addr_1',
      },
      branch: {
        branchId: 'branch_1',
      },
      cart: {
        cartId: 'cart_1',
      },
      pricing: {
        currencyCode: 'MMK',
        subtotalAmount: '6500',
        discountAmount: '0',
        deliveryFee: '0',
        totalAmount: '6500',
      },
    });
  });

  it('applies the resolved promotion discount to the pricing breakdown', async () => {
    const service = new CheckoutPricingService({
      evaluatePromotionForCheckout: jest.fn().mockResolvedValue({
        promotionId: 'promo_1',
        code: 'SAVE10',
        name: 'Save 10 percent',
        discountType: PromotionDiscountType.PERCENTAGE,
        discountAmount: new Prisma.Decimal('650'),
        appliedPromotion: {
          promotionId: 'promo_1',
          code: 'SAVE10',
          name: 'Save 10 percent',
          discountType: PromotionDiscountType.PERCENTAGE,
          discountAmount: '650',
        },
      }),
    } as unknown as jest.Mocked<PromotionPricingService>);

    const result = await service.buildPricingBreakdown(makeCheckoutContext(), {
      promotionCode: 'save10',
    });

    expect(result.discountAmount.toString()).toBe('650');
    expect(result.totalAmount.toString()).toBe('5850');
    expect(result.appliedPromotion).toMatchObject({
      code: 'SAVE10',
      discountAmount: '650',
    });
  });
});
