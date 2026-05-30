import {
  BranchStatus,
  MerchantStatus,
  OrderStatus,
  RiderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { OrderSummaryEntity } from '../../../../src/modules/orders/entities/order-summary.entity';
import { OrderPolicyService } from '../../../../src/modules/orders/policies/order-policy.service';
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

describe('OrderPolicyService', () => {
  const service = new OrderPolicyService();

  it('allows customers to view only their own orders', () => {
    const customerUser = makeAuthenticatedUser({
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

    expect(service.canViewOrder(customerUser, makeOrderSummary())).toBe(true);
    expect(
      service.canViewOrder(
        customerUser,
        makeOrderSummary({
          customer: {
            customerProfileId: 'cust_prof_2',
            userId: 'usr_customer_2',
            phone: '0991111111',
            userStatus: UserStatus.ACTIVE,
            fullName: 'Other Customer',
            avatarUrl: null,
          },
        }),
      ),
    ).toBe(false);
  });

  it('allows merchants to view only orders from their own merchant scope', () => {
    const merchantUser = makeAuthenticatedUser({
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

    expect(service.canViewOrder(merchantUser, makeOrderSummary())).toBe(true);
    expect(
      service.canViewOrder(
        merchantUser,
        makeOrderSummary({
          branch: {
            branchId: 'branch_2',
            branchName: 'Other Branch',
            branchStatus: BranchStatus.ACTIVE,
            township: 'Tamwe',
            merchantId: 'merchant_2',
            merchantUserId: 'usr_merchant_2',
            merchantName: 'Other Merchant',
            merchantStatus: MerchantStatus.ACTIVE,
          },
        }),
      ),
    ).toBe(false);
  });

  it('allows riders to view only assigned delivery orders', () => {
    const riderUser = makeAuthenticatedUser({
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

    expect(service.canViewOrder(riderUser, makeOrderSummary())).toBe(true);
    expect(
      service.canViewOrder(
        riderUser,
        makeOrderSummary({
          delivery: null,
        }),
      ),
    ).toBe(false);
  });

  it('allows admins to view any order and override statuses', () => {
    const adminUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0990000000',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    expect(service.canViewOrder(adminUser, makeOrderSummary())).toBe(true);
    expect(service.canViewAdminOrders(adminUser)).toBe(true);
    expect(service.canAdminCancelOrder(adminUser, makeOrderSummary())).toBe(true);
    expect(service.canAdminOverrideStatus(adminUser)).toBe(true);
    expect(
      service.canAdminAssignRider(
        adminUser,
        makeOrderSummary({
          status: OrderStatus.PREPARING,
        }),
      ),
    ).toBe(true);
    expect(
      service.canAdminCancelOrder(
        adminUser,
        makeOrderSummary({
          status: OrderStatus.DELIVERED,
        }),
      ),
    ).toBe(false);
    expect(
      service.canAdminAssignRider(
        adminUser,
        makeOrderSummary({
          status: OrderStatus.RIDER_ASSIGNED,
        }),
      ),
    ).toBe(false);
  });

  it('allows customer cancellation only before fulfillment progresses too far', () => {
    const customerUser = makeAuthenticatedUser({
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

    expect(service.canCancelCustomerOrder(customerUser, makeOrderSummary())).toBe(
      true,
    );
    expect(
      service.canCancelCustomerOrder(
        customerUser,
        makeOrderSummary({
          status: OrderStatus.ON_THE_WAY,
        }),
      ),
    ).toBe(false);
  });

  it('allows merchant accept/reject only from placed state and preparing only after acceptance', () => {
    const merchantUser = makeAuthenticatedUser({
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

    expect(service.canMerchantAccept(merchantUser, makeOrderSummary())).toBe(true);
    expect(service.canMerchantReject(merchantUser, makeOrderSummary())).toBe(true);
    expect(service.canMarkPreparing(merchantUser, makeOrderSummary())).toBe(false);
    expect(
      service.canMarkPreparing(
        merchantUser,
        makeOrderSummary({
          status: OrderStatus.MERCHANT_ACCEPTED,
        }),
      ),
    ).toBe(true);
  });

  it('allows rider actions only across the supported fulfillment progression', () => {
    const riderUser = makeAuthenticatedUser({
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
      service.canRiderAcceptAssignment(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.RIDER_ASSIGNED,
        }),
      ),
    ).toBe(true);
    expect(
      service.canRiderRejectAssignment(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.RIDER_ASSIGNED,
        }),
      ),
    ).toBe(true);
    expect(
      service.canRiderMarkPickedUp(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.RIDER_ACCEPTED,
        }),
      ),
    ).toBe(true);
    expect(
      service.canRiderMarkOnTheWay(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.PICKED_UP,
        }),
      ),
    ).toBe(true);
    expect(
      service.canRiderMarkDelivered(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.ON_THE_WAY,
        }),
      ),
    ).toBe(true);
    expect(
      service.canRiderMarkFailedDelivery(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.PICKED_UP,
        }),
      ),
    ).toBe(true);
    expect(
      service.canRiderMarkFailedDelivery(
        riderUser,
        makeOrderSummary({
          status: OrderStatus.RIDER_ACCEPTED,
        }),
      ),
    ).toBe(false);
  });
});
