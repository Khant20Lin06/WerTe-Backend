import { OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { AdminOrdersController } from '../../../../src/modules/orders/controllers/admin-orders.controller';
import { OrderDetailEntity } from '../../../../src/modules/orders/entities/order-detail.entity';
import { OrderSummaryEntity } from '../../../../src/modules/orders/entities/order-summary.entity';
import { AdminOrderOperationsService } from '../../../../src/modules/orders/services/admin-order-operations.service';
import { OrderQueryService } from '../../../../src/modules/orders/services/order-query.service';

function makeOrderSummary(): OrderSummaryEntity {
  return {
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
    availableActions: ['admin_cancel', 'admin_override_status'],
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
    delivery: null,
  } as OrderSummaryEntity;
}

function makeOrderDetail(
  overrides?: Partial<OrderDetailEntity>,
): OrderDetailEntity {
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
    ...overrides,
  };
}

describe('AdminOrdersController', () => {
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

  it('delegates list requests to the admin order query service', async () => {
    const orderQueryService = {
      listAdminOrders: jest.fn().mockResolvedValue([makeOrderSummary()]),
    } as unknown as jest.Mocked<OrderQueryService>;
    const controller = new AdminOrdersController(
      orderQueryService,
      {} as AdminOrderOperationsService,
    );

    const result = await controller.list(currentUser);

    expect(orderQueryService.listAdminOrders).toHaveBeenCalledWith(currentUser);
    expect(result[0]).toMatchObject({
      orderId: 'order_1',
      availableActions: ['admin_cancel', 'admin_override_status'],
    });
  });

  it('delegates detail requests to the admin order query service', async () => {
    const orderQueryService = {
      getAdminOrderDetail: jest.fn().mockResolvedValue(makeOrderDetail()),
    } as unknown as jest.Mocked<OrderQueryService>;
    const controller = new AdminOrdersController(
      orderQueryService,
      {} as AdminOrderOperationsService,
    );

    const result = await controller.detail(currentUser, 'order_1');

    expect(orderQueryService.getAdminOrderDetail).toHaveBeenCalledWith(
      currentUser,
      'order_1',
    );
    expect(result).toMatchObject({
      orderId: 'order_1',
    });
  });

  it('delegates admin cancellation to the admin order operations service', async () => {
    const adminOrderOperationsService = {
      cancelAdminOrder: jest.fn().mockResolvedValue(makeOrderDetail()),
    } as unknown as jest.Mocked<AdminOrderOperationsService>;
    const controller = new AdminOrdersController(
      {} as OrderQueryService,
      adminOrderOperationsService,
    );

    const result = await controller.cancel(currentUser, 'order_1', {
      reasonCode: 'admin_cancelled_duplicate_order',
      note: 'Customer placed a duplicate order.',
    });

    expect(adminOrderOperationsService.cancelAdminOrder).toHaveBeenCalledWith(
      currentUser,
      {
        orderId: 'order_1',
        reasonCode: 'admin_cancelled_duplicate_order',
        note: 'Customer placed a duplicate order.',
      },
    );
    expect(result).toMatchObject({
      orderId: 'order_1',
    });
  });

  it('delegates admin status overrides to the admin order operations service', async () => {
    const adminOrderOperationsService = {
      overrideAdminOrderStatus: jest.fn().mockResolvedValue(
        makeOrderDetail({
          status: OrderStatus.RIDER_ASSIGNED,
        }),
      ),
    } as unknown as jest.Mocked<AdminOrderOperationsService>;
    const controller = new AdminOrdersController(
      {} as OrderQueryService,
      adminOrderOperationsService,
    );

    const result = await controller.updateStatus(currentUser, 'order_1', {
      status: OrderStatus.RIDER_ASSIGNED,
      reasonCode: 'admin_override_manual_assignment',
      note: 'Dispatcher is moving the order into rider assignment.',
    });

    expect(
      adminOrderOperationsService.overrideAdminOrderStatus,
    ).toHaveBeenCalledWith(currentUser, {
      orderId: 'order_1',
      status: OrderStatus.RIDER_ASSIGNED,
      reasonCode: 'admin_override_manual_assignment',
      note: 'Dispatcher is moving the order into rider assignment.',
    });
    expect(result).toMatchObject({
      orderId: 'order_1',
      status: OrderStatus.RIDER_ASSIGNED,
    });
  });
});
