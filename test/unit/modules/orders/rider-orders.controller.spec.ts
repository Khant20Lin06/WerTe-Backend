import { DeliveryType, OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { OrderDetailEntity } from '../../../../src/modules/orders/entities/order-detail.entity';
import { OrderSummaryEntity } from '../../../../src/modules/orders/entities/order-summary.entity';
import { RiderOrdersController } from '../../../../src/modules/orders/controllers/rider-orders.controller';
import { OrderQueryService } from '../../../../src/modules/orders/services/order-query.service';

function makeOrderSummary(): OrderSummaryEntity {
  return {
    orderId: 'order_1',
    orderCode: 'ORD-00000001',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    addressId: 'addr_1',
    cartId: 'cart_1',
    status: OrderStatus.RIDER_ASSIGNED,
    deliveryType: DeliveryType.DELIVERY,
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
      userId: 'usr_1',
      phone: '09123456789',
      userStatus: UserStatus.ACTIVE,
      fullName: 'Mg Mg',
      avatarUrl: null,
    },
    branch: {
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      branchStatus: 'ACTIVE',
      township: 'Botahtaung',
      merchantId: 'merchant_1',
      merchantUserId: 'usr_merchant_1',
      merchantName: 'Merchant One',
      merchantStatus: 'ACTIVE',
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
        status: 'ACTIVE',
      },
    },
  } as OrderSummaryEntity;
}

function makeOrderDetail(): OrderDetailEntity {
  return {
    ...makeOrderSummary(),
    deliveryAddress: {
      addressId: 'addr_1',
      label: 'Home',
      line1: 'No. 1, Main Road',
      line2: null,
      landmark: null,
      township: 'Botahtaung',
      city: 'Yangon',
      postalCode: null,
      deliveryInstructions: null,
      latitude: '16.834',
      longitude: '96.176',
    },
    items: [],
    timeline: [],
  };
}

describe('RiderOrdersController', () => {
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

  it('delegates list requests to the rider-scoped order query service', async () => {
    const orderQueryService = {
      listRiderOrders: jest.fn().mockResolvedValue({
        orders: [makeOrderSummary()],
        nextCursor: null,
        hasMore: false,
      }),
    } as unknown as jest.Mocked<OrderQueryService>;
    const controller = new RiderOrdersController(orderQueryService);

    const result = await controller.list(currentUser, {});

    expect(orderQueryService.listRiderOrders).toHaveBeenCalledWith(currentUser, {
      cursor: undefined,
      limit: undefined,
    });
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
    expect(result.data[0]).toMatchObject({
      orderId: 'order_1',
    });
  });

  it('delegates detail requests to the rider-scoped order query service', async () => {
    const orderQueryService = {
      getRiderOrderDetail: jest.fn().mockResolvedValue(makeOrderDetail()),
    } as unknown as jest.Mocked<OrderQueryService>;
    const controller = new RiderOrdersController(orderQueryService);

    const result = await controller.detail(currentUser, 'order_1');

    expect(orderQueryService.getRiderOrderDetail).toHaveBeenCalledWith(
      currentUser,
      'order_1',
    );
    expect(result).toMatchObject({
      orderId: 'order_1',
      delivery: {
        riderId: 'rider_1',
      },
    });
  });
});
