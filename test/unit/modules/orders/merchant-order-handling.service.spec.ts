import { HttpStatus } from '@nestjs/common';
import { OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../../../src/modules/menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { OrderDetailEntity } from '../../../../src/modules/orders/entities/order-detail.entity';
import { OrderPolicyService } from '../../../../src/modules/orders/policies/order-policy.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';
import { MerchantOrderHandlingService } from '../../../../src/modules/orders/services/merchant-order-handling.service';
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
    availableActions: ['merchant_accept', 'merchant_reject'],
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

describe('MerchantOrderHandlingService', () => {
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

  const makeService = () => {
    const prisma = {
      runInTransaction: jest.fn(
        async (callback: (tx: unknown) => Promise<unknown>) => callback({}),
      ),
    } as unknown as jest.Mocked<PrismaService>;
    const repository = {
      findMerchantOrderDetail: jest.fn(),
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
    const queueService = { add: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<QueueService>;
    const service = new MerchantOrderHandlingService(
      prisma,
      repository,
      new OrderPolicyService(),
      queryService,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
      queueService,
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

  it('accepts an eligible placed order and appends merchant acceptance history', async () => {
    const { repository, queryService, systemMessageService, service } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.PLACED,
    });
    const acceptedOrder = makeOrderDetail({
      status: OrderStatus.MERCHANT_ACCEPTED,
      availableActions: ['mark_preparing'],
    });

    repository.findMerchantOrderDetail.mockResolvedValue({
      status: OrderStatus.PLACED,
    } as never);
    queryService.buildOrderDetail
      .mockReturnValueOnce(currentOrder)
      .mockReturnValueOnce(acceptedOrder);
    repository.updateOrderStatus.mockResolvedValue({} as never);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.acceptCurrentMerchantOrder(currentUser, {
      orderId: 'order_1',
    });

    expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
      status: OrderStatus.MERCHANT_ACCEPTED,
      fromStatus: OrderStatus.PLACED,
      changedByUserId: 'usr_merchant_1',
      reasonCode: 'merchant_accepted',
      note: null,
    }, expect.anything());
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'ORDER_ACCEPTED',
      }),
    );
    expect(result.status).toBe(OrderStatus.MERCHANT_ACCEPTED);
  });

  it('rejects an eligible placed order with merchant-supplied reason metadata', async () => {
    const {
      repository,
      queryService,
      menuInventoryLifecycleService,
      notificationEventService,
      service,
    } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.PLACED,
    });
    const rejectedOrder = makeOrderDetail({
      status: OrderStatus.MERCHANT_REJECTED,
      availableActions: [],
    });

    repository.findMerchantOrderDetail.mockResolvedValue({
      status: OrderStatus.PLACED,
      items: [
        {
          menuItemId: 'item_1',
          quantity: 1,
          menuItemStockTrackedSnapshot: true,
          selectedVariantCombinationId: undefined,
          variantCombinationStockTrackedSnapshot: undefined,
          inventoryLotAllocations: [],
          selectedOptions: [
            {
              itemOptionId: 'option_1',
              itemOptionStockTrackedSnapshot: true,
            },
          ],
        },
      ],
    } as never);
    queryService.buildOrderDetail
      .mockReturnValueOnce(currentOrder)
      .mockReturnValueOnce(rejectedOrder);
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

    const result = await service.rejectCurrentMerchantOrder(currentUser, {
      orderId: 'order_1',
      reasonCode: 'merchant_rejected_out_of_stock',
      note: 'Out of stock',
    });

    expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
      status: OrderStatus.MERCHANT_REJECTED,
      fromStatus: OrderStatus.PLACED,
      changedByUserId: 'usr_merchant_1',
      reasonCode: 'merchant_rejected_out_of_stock',
      note: 'Out of stock',
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
          selectedOptions: [
            {
              itemOptionId: 'option_1',
              itemOptionStockTrackedSnapshot: true,
            },
          ],
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
        reasonCode: 'merchant_rejected_out_of_stock',
      }),
    );
    expect(result.status).toBe(OrderStatus.MERCHANT_REJECTED);
  });

  it('marks an accepted order as preparing when the transition is allowed', async () => {
    const { repository, queryService, service } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.MERCHANT_ACCEPTED,
      availableActions: ['mark_preparing'],
    });
    const preparingOrder = makeOrderDetail({
      status: OrderStatus.PREPARING,
      availableActions: [],
    });

    repository.findMerchantOrderDetail.mockResolvedValue({
      status: OrderStatus.MERCHANT_ACCEPTED,
    } as never);
    queryService.buildOrderDetail
      .mockReturnValueOnce(currentOrder)
      .mockReturnValueOnce(preparingOrder);
    repository.updateOrderStatus.mockResolvedValue({} as never);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.markPreparingCurrentMerchantOrder(currentUser, {
      orderId: 'order_1',
    });

    expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
      status: OrderStatus.PREPARING,
      fromStatus: OrderStatus.MERCHANT_ACCEPTED,
      changedByUserId: 'usr_merchant_1',
      reasonCode: 'merchant_preparing',
      note: null,
    }, expect.anything());
    expect(result.status).toBe(OrderStatus.PREPARING);
  });

  it('returns the current order when the merchant retries the same target action', async () => {
    const { repository, queryService, service } = makeService();
    const acceptedOrder = makeOrderDetail({
      status: OrderStatus.MERCHANT_ACCEPTED,
      availableActions: ['mark_preparing'],
    });

    repository.findMerchantOrderDetail.mockResolvedValue({
      status: OrderStatus.MERCHANT_ACCEPTED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(acceptedOrder);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.acceptCurrentMerchantOrder(currentUser, {
      orderId: 'order_1',
    });

    expect(repository.updateOrderStatus).not.toHaveBeenCalled();
    expect(result.status).toBe(OrderStatus.MERCHANT_ACCEPTED);
  });

  it('rejects merchant actions when the transition is not allowed anymore', async () => {
    const { repository, queryService, service } = makeService();
    const deliveredOrder = makeOrderDetail({
      status: OrderStatus.DELIVERED,
      availableActions: [],
    });

    repository.findMerchantOrderDetail.mockResolvedValue({
      status: OrderStatus.DELIVERED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(deliveredOrder);

    await expect(
      service.acceptCurrentMerchantOrder(currentUser, {
        orderId: 'order_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });

  it('rejects merchant actions when the scoped order cannot be found', async () => {
    const { repository, service } = makeService();

    repository.findMerchantOrderDetail.mockResolvedValue(null);

    await expect(
      service.acceptCurrentMerchantOrder(currentUser, {
        orderId: 'order_missing',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });
});
