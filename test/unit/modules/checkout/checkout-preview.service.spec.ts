import { UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { CheckoutContextEntity } from '../../../../src/modules/checkout/entities/checkout-context.entity';
import { CheckoutPreviewService } from '../../../../src/modules/checkout/services/checkout-preview.service';
import { CheckoutContextService } from '../../../../src/modules/checkout/services/checkout-context.service';
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
      merchantStatus: 'ACTIVE',
      branchName: 'Downtown Branch',
      township: 'Botahtaung',
      branchStatus: 'ACTIVE',
    } as CheckoutContextEntity['branch'],
    cart: {
      cartId: 'cart_1',
      customerProfileId: 'cust_prof_1',
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      branchName: 'Downtown Branch',
      branchStatus: 'ACTIVE',
      merchantStatus: 'ACTIVE',
      status: 'ACTIVE',
      totalQuantity: 2,
      subtotalAmount: '6500',
      totalAmount: '6500',
      isEmpty: false,
      items: [],
    } as CheckoutContextEntity['cart'],
    ...overrides,
  };
}

describe('CheckoutPreviewService', () => {
  it('builds a checkout preview from the validated checkout context', async () => {
    const currentUser = makeAuthenticatedUser();
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const checkoutPricingService = new CheckoutPricingService({
      evaluatePromotionForCheckout: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<PromotionPricingService>);
    const service = new CheckoutPreviewService(
      checkoutContextService,
      checkoutPricingService,
    );

    const result = await service.previewCurrentCustomerCheckout(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
    });

    expect(
      checkoutContextService.getValidatedCurrentCustomerCheckoutContext,
    ).toHaveBeenCalledWith(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
    });
    expect(result).toMatchObject({
      currencyCode: 'MMK',
      cart: {
        cartId: 'cart_1',
      },
      pricing: {
        subtotalAmount: '6500',
        discountAmount: '0',
        deliveryFee: '0',
        totalAmount: '6500',
      },
    });
  });
});
