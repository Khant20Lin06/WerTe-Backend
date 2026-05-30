import {
  BranchStatus,
  MerchantStatus,
  OrderStatus,
  RiderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { OrderSummaryEntity } from '../../../../src/modules/orders/entities/order-summary.entity';
import {
  computeOrderAvailableActions,
  OrderAvailableActions,
} from '../../../../src/modules/orders/policies/order-available-actions.helper';
import { OrderPolicyService } from '../../../../src/modules/orders/policies/order-policy.service';

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

describe('order available actions helper', () => {
  const orderPolicyService = new OrderPolicyService();

  it('returns cancel for a customer-owned cancellable order', () => {
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
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary(),
        orderPolicyService,
      }),
    ).toEqual([OrderAvailableActions.cancel]);
  });

  it('returns merchant accept and reject for a placed merchant-owned order', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0942000000',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });

    expect(
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary(),
        orderPolicyService,
      }),
    ).toEqual([
      OrderAvailableActions.merchantAccept,
      OrderAvailableActions.merchantReject,
    ]);
  });

  it('returns mark preparing for an accepted merchant-owned order', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0942000000',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });

    expect(
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          status: OrderStatus.MERCHANT_ACCEPTED,
        }),
        orderPolicyService,
      }),
    ).toEqual([OrderAvailableActions.markPreparing]);
  });

  it('returns accept and reject actions for rider-assigned rider-visible orders', () => {
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
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          status: OrderStatus.RIDER_ASSIGNED,
        }),
        orderPolicyService,
      }),
    ).toEqual([
      OrderAvailableActions.riderAcceptAssignment,
      OrderAvailableActions.riderRejectAssignment,
    ]);
  });

  it('returns delivery completion actions for in-transit rider orders', () => {
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
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          status: OrderStatus.ON_THE_WAY,
        }),
        orderPolicyService,
      }),
    ).toEqual([
      OrderAvailableActions.riderMarkDelivered,
      OrderAvailableActions.riderMarkFailedDelivery,
    ]);
  });

  it('returns admin cancel plus override for cancellable admin-visible orders', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0990000000',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          status: OrderStatus.RIDER_ASSIGNED,
        }),
        orderPolicyService,
      }),
    ).toEqual([
      OrderAvailableActions.adminCancel,
      OrderAvailableActions.adminOverrideStatus,
    ]);
  });

  it('returns admin assign rider for preparing admin-visible orders', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0990000000',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          status: OrderStatus.PREPARING,
        }),
        orderPolicyService,
      }),
    ).toEqual([
      OrderAvailableActions.adminAssignRider,
      OrderAvailableActions.adminCancel,
      OrderAvailableActions.adminOverrideStatus,
    ]);
  });

  it('returns only admin override for delivered admin-visible orders', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0990000000',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          status: OrderStatus.DELIVERED,
        }),
        orderPolicyService,
      }),
    ).toEqual([OrderAvailableActions.adminOverrideStatus]);
  });

  it('returns no actions when the actor cannot access the order resource', () => {
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
      computeOrderAvailableActions({
        currentUser,
        order: makeOrderSummary({
          customer: {
            customerProfileId: 'cust_prof_2',
            userId: 'usr_customer_2',
            phone: '0991111111',
            userStatus: UserStatus.ACTIVE,
            fullName: 'Other Customer',
            avatarUrl: null,
          },
        }),
        orderPolicyService,
      }),
    ).toEqual([]);
  });
});
