import {
  BranchStatus,
  MerchantStatus,
  OrderStatus,
  RiderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import {
  hasCustomerOrderAccess,
  hasMerchantOrderAccess,
  hasRiderOrderAccess,
} from '../../../../src/modules/orders/policies/order-access-policy.helper';
import { OrderSummaryEntity } from '../../../../src/modules/orders/entities/order-summary.entity';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

function makeOrderSummary(
  overrides?: Partial<OrderSummaryEntity>,
): OrderSummaryEntity {
  const base: OrderSummaryEntity = {
    orderId: 'order_1',
    orderCode: 'ORD-00000001',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    addressId: 'addr_1',
    cartId: 'cart_1',
    status: OrderStatus.PLACED,
    currencyCode: 'MMK',
    subtotalAmount: '6500',
    discountAmount: '0',
    deliveryFee: '500',
    totalAmount: '7000',
    placedAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-19T10:05:00.000Z',
    availableActions: [],
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_customer_1',
      phone: '09123456789',
      userStatus: UserStatus.ACTIVE,
      fullName: 'Mg Mg',
      avatarUrl: null,
    },
    branch: {
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      branchStatus: BranchStatus.ACTIVE,
      township: 'Botahtaung',
      merchantId: 'merchant_1',
      merchantUserId: 'usr_merchant_1',
      merchantName: 'Merchant One',
      merchantStatus: MerchantStatus.ACTIVE,
    },
    delivery: {
      deliveryId: 'delivery_1',
      riderId: 'rider_1',
      etaMinutes: 15,
      rider: {
        riderId: 'rider_1',
        userId: 'usr_rider_1',
        phone: '0999999999',
        userStatus: UserStatus.ACTIVE,
        displayName: 'Ko Aung',
        vehicleType: 'bike',
        currentTownship: 'Pabedan',
        status: RiderStatus.ACTIVE,
      },
    },
  };

  return {
    ...base,
    ...overrides,
    availableActions: overrides?.availableActions ?? base.availableActions,
  };
}

describe('order access policy helper', () => {
  it('allows customer order access when user and scoped profile match', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_customer_1',
      role: UserRole.CUSTOMER,
      actorContext: {
        userId: 'usr_customer_1',
        phone: '09123456789',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfileId: 'cust_prof_1',
      },
    });

    expect(
      hasCustomerOrderAccess({
        currentUser,
        order: makeOrderSummary(),
      }),
    ).toBe(true);
  });

  it('denies merchant order access when merchant scope mismatches', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0942000000',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_2',
      },
    });

    expect(
      hasMerchantOrderAccess({
        currentUser,
        order: makeOrderSummary(),
      }),
    ).toBe(false);
  });

  it('denies rider order access when no assigned rider context exists', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_rider_1',
      role: UserRole.RIDER,
      actorContext: {
        userId: 'usr_rider_1',
        phone: '0999999999',
        role: UserRole.RIDER,
        status: UserStatus.ACTIVE,
        riderId: 'rider_1',
      },
    });

    expect(
      hasRiderOrderAccess({
        currentUser,
        order: makeOrderSummary({
          delivery: null,
        }),
      }),
    ).toBe(false);
  });
});
