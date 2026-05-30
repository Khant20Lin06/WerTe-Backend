import { UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { CustomerCheckoutController } from '../../../../src/modules/checkout/controllers/customer-checkout.controller';
import { CheckoutPreviewEntity } from '../../../../src/modules/checkout/entities/checkout-preview.entity';
import { CheckoutPreviewService } from '../../../../src/modules/checkout/services/checkout-preview.service';

function makeCheckoutPreview(
  overrides?: Partial<CheckoutPreviewEntity>,
): CheckoutPreviewEntity {
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
    },
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
    } as CheckoutPreviewEntity['cart'],
    pricing: {
      currencyCode: 'MMK',
      subtotalAmount: '6500',
      discountAmount: '0',
      deliveryFee: '0',
      totalAmount: '6500',
    },
    ...overrides,
  };
}

describe('CustomerCheckoutController', () => {
  it('delegates preview requests to the checkout preview service and maps the response DTO', async () => {
    const currentUser = makeAuthenticatedUser({
      actorContext: {
        userId: 'usr_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    });
    const checkoutPreviewService = {
      previewCurrentCustomerCheckout: jest
        .fn()
        .mockResolvedValue(makeCheckoutPreview()),
    } as unknown as jest.Mocked<CheckoutPreviewService>;
    const controller = new CustomerCheckoutController(checkoutPreviewService);

    const result = await controller.preview(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
    });

    expect(
      checkoutPreviewService.previewCurrentCustomerCheckout,
    ).toHaveBeenCalledWith(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      promotionCode: undefined,
    });
    expect(result).toMatchObject({
      currencyCode: 'MMK',
      customer: {
        customerProfileId: 'cust_prof_1',
      },
      branch: {
        branchId: 'branch_1',
      },
      cart: {
        cartId: 'cart_1',
      },
      pricing: {
        totalAmount: '6500',
      },
    });
  });
});
