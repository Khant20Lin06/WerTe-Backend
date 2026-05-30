import { HttpStatus } from '@nestjs/common';
import { OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../../../src/modules/menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { OrderDetailEntity } from '../../../../src/modules/orders/entities/order-detail.entity';
import { OrderPolicyService } from '../../../../src/modules/orders/policies/order-policy.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';
import { AdminOrderOperationsService } from '../../../../src/modules/orders/services/admin-order-operations.service';
import { OrderQueryService } from '../../../../src/modules/orders/services/order-query.service';

function makeOrderDetail(
  overrides?: Partial<OrderDetailEntity>,
): OrderDetailEntity {
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
      userId: 'usr_customer_1',
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

describe('AdminOrderOperationsService', () => {
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

  const makeService = () => {
    const prisma = {
      runInTransaction: jest.fn(
        async (callback: (tx: unknown) => Promise<unknown>) => callback({}),
      ),
    } as unknown as jest.Mocked<PrismaService>;
    const repository = {
      findOrderDetailById: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;
    const queryService = {
      buildOrderDetail: jest.fn(),
      attachAvailableActions: jest.fn(),
    } as unknown as jest.Mocked<OrderQueryService>;
    const systemMessageService = {
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SystemMessageService>;
    const menuInventoryLifecycleService = {
      restoreTrackedInventoryForOrder: jest.fn().mockResolvedValue(undefined),
      collectTrackedInventoryRestorationAlerts: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<MenuInventoryLifecycleService>;
    const notificationEventService = {
      publishMerchantInventoryCompensationAlert: jest
        .fn()
        .mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationEventService>;
    const service = new AdminOrderOperationsService(
      prisma,
      repository,
      new OrderPolicyService(),
      queryService,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
    );

    return {
      prisma,
      repository,
      queryService,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
      service,
    };
  };

  it('cancels an eligible admin-visible order and appends admin cancellation history', async () => {
    const {
      repository,
      queryService,
      menuInventoryLifecycleService,
      notificationEventService,
      service,
    } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.MERCHANT_ACCEPTED,
    });
    const cancelledOrder = makeOrderDetail({
      status: OrderStatus.CANCELLED,
      availableActions: ['admin_override_status'],
    });

    repository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.MERCHANT_ACCEPTED,
      items: [
        {
          menuItemId: 'item_1',
          quantity: 1,
          menuItemStockTrackedSnapshot: true,
          selectedVariantCombinationId: undefined,
          variantCombinationStockTrackedSnapshot: undefined,
          inventoryLotAllocations: [],
          selectedOptions: [],
        },
      ],
    } as never);
    queryService.buildOrderDetail
      .mockReturnValueOnce(currentOrder)
      .mockReturnValueOnce(cancelledOrder);
    repository.updateOrderStatus.mockResolvedValue({} as never);
    menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts.mockResolvedValue([
      {
        merchantUserId: 'usr_merchant_1',
        branchId: 'branch_1',
        branchName: null,
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        resourceLabel: 'Mohinga',
        restoredQuantity: 1,
        stockQuantity: 4,
        lowStockThreshold: 3,
      },
    ]);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.cancelAdminOrder(currentUser, {
      orderId: 'order_1',
      reasonCode: 'admin_cancelled_duplicate_order',
      note: 'Customer placed a duplicate order.',
    });

    expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
      status: OrderStatus.CANCELLED,
      fromStatus: OrderStatus.MERCHANT_ACCEPTED,
      changedByUserId: 'usr_admin_1',
      reasonCode: 'admin_cancelled_duplicate_order',
      note: 'Customer placed a duplicate order.',
    }, expect.anything());
    expect(
      menuInventoryLifecycleService.restoreTrackedInventoryForOrder,
    ).toHaveBeenCalledWith(
      [
        {
          menuItemId: 'item_1',
          quantity: 1,
          menuItemStockTrackedSnapshot: true,
          selectedVariantCombinationId: undefined,
          variantCombinationStockTrackedSnapshot: undefined,
          inventoryLotAllocations: [],
          selectedOptions: [],
        },
      ],
      expect.anything(),
    );
    expect(
      notificationEventService.publishMerchantInventoryCompensationAlert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'item_1',
        restoredQuantity: 1,
        orderCode: 'ORD-00000001',
        reasonCode: 'admin_cancelled_duplicate_order',
      }),
    );
    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('returns the current order when the admin retries cancelling an already cancelled order', async () => {
    const { repository, queryService, service } = makeService();
    const cancelledOrder = makeOrderDetail({
      status: OrderStatus.CANCELLED,
      availableActions: ['admin_override_status'],
    });

    repository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.CANCELLED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(cancelledOrder);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.cancelAdminOrder(currentUser, {
      orderId: 'order_1',
    });

    expect(repository.updateOrderStatus).not.toHaveBeenCalled();
    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('rejects admin cancellation when the order is already terminal', async () => {
    const { repository, queryService, service } = makeService();
    const deliveredOrder = makeOrderDetail({
      status: OrderStatus.DELIVERED,
      availableActions: ['admin_override_status'],
    });

    repository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.DELIVERED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(deliveredOrder);

    await expect(
      service.cancelAdminOrder(currentUser, {
        orderId: 'order_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });

  it('overrides an admin-visible order status when a reason code is provided', async () => {
    const { repository, queryService, service } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.PREPARING,
    });
    const overriddenOrder = makeOrderDetail({
      status: OrderStatus.RIDER_ASSIGNED,
      availableActions: ['admin_cancel', 'admin_override_status'],
    });

    repository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.PREPARING,
    } as never);
    queryService.buildOrderDetail
      .mockReturnValueOnce(currentOrder)
      .mockReturnValueOnce(overriddenOrder);
    repository.updateOrderStatus.mockResolvedValue({} as never);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.overrideAdminOrderStatus(currentUser, {
      orderId: 'order_1',
      status: OrderStatus.RIDER_ASSIGNED,
      reasonCode: 'admin_override_manual_assignment',
      note: 'Dispatcher is moving this order into rider assignment.',
    });

    expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
      status: OrderStatus.RIDER_ASSIGNED,
      fromStatus: OrderStatus.PREPARING,
      changedByUserId: 'usr_admin_1',
      reasonCode: 'admin_override_manual_assignment',
      note: 'Dispatcher is moving this order into rider assignment.',
    }, expect.anything());
    expect(result.status).toBe(OrderStatus.RIDER_ASSIGNED);
  });

  it('returns the current order when the admin retries the same override target status', async () => {
    const { repository, queryService, service } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.RIDER_ASSIGNED,
    });

    repository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.RIDER_ASSIGNED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(currentOrder);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.overrideAdminOrderStatus(currentUser, {
      orderId: 'order_1',
      status: OrderStatus.RIDER_ASSIGNED,
      reasonCode: 'admin_override_manual_assignment',
    });

    expect(repository.updateOrderStatus).not.toHaveBeenCalled();
    expect(result.status).toBe(OrderStatus.RIDER_ASSIGNED);
  });

  it('rejects admin status overrides when the reason code is missing or blank', async () => {
    const { service } = makeService();

    await expect(
      service.overrideAdminOrderStatus(currentUser, {
        orderId: 'order_1',
        status: OrderStatus.RIDER_ASSIGNED,
        reasonCode: '   ',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  });
});
