import { HttpStatus } from '@nestjs/common';
import { ItemOptionGroupKind, OrderStatus, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../../../src/modules/menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { OrderDetailEntity } from '../../../../src/modules/orders/entities/order-detail.entity';
import { OrderPolicyService } from '../../../../src/modules/orders/policies/order-policy.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';
import { OrderCancellationService } from '../../../../src/modules/orders/services/order-cancellation.service';
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
    availableActions: ['cancel'],
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

describe('OrderCancellationService', () => {
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

  const makeService = () => {
    const prisma = {
      runInTransaction: jest.fn(
        async (callback: (tx: unknown) => Promise<unknown>) => callback({}),
      ),
    } as unknown as jest.Mocked<PrismaService>;
    const repository = {
      findCustomerOrderDetail: jest.fn(),
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
    const service = new OrderCancellationService(
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

  it('cancels an eligible customer order and appends a cancellation history entry', async () => {
    const {
      repository,
      queryService,
      menuInventoryLifecycleService,
      notificationEventService,
      service,
    } = makeService();
    const currentOrder = makeOrderDetail({
      status: OrderStatus.PLACED,
      items: [
        {
          orderItemId: 'order_item_1',
          menuItemId: 'item_1',
          categoryId: 'cat_1',
          nameSnapshot: 'Mohinga',
          descriptionSnapshot: null,
          imageUrlSnapshot: null,
          unitBasePriceSnapshot: '2500',
          unitPriceSnapshot: '3250',
          selectedVariantCombinationId: null,
          selectedVariantCombinationNameSnapshot: null,
          quantity: 2,
          lineTotal: '6500',
          inventoryLotAllocations: [],
          selectedOptions: [
            {
              orderItemOptionId: 'order_item_option_1',
              itemOptionId: 'option_1',
              optionGroupId: 'group_1',
              optionGroupNameSnapshot: 'Choose extras',
              optionGroupKindSnapshot: ItemOptionGroupKind.ADD_ON,
              nameSnapshot: 'Extra fish cake',
              priceDeltaSnapshot: '750',
            },
          ],
        },
      ],
    });
    const cancelledOrder = makeOrderDetail({
      status: OrderStatus.CANCELLED,
      availableActions: [],
    });

    repository.findCustomerOrderDetail.mockResolvedValue({
      status: OrderStatus.PLACED,
      items: [
        {
          menuItemId: 'item_1',
          quantity: 2,
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
        restoredQuantity: 2,
        stockQuantity: 5,
        lowStockThreshold: 3,
      },
    ]);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.cancelCurrentCustomerOrder(currentUser, {
      orderId: 'order_1',
      reasonCode: 'customer_changed_mind',
      note: 'Wrong address',
    });

    expect(
      menuInventoryLifecycleService.restoreTrackedInventoryForOrder,
    ).toHaveBeenCalledWith(
      [
        {
          menuItemId: 'item_1',
          quantity: 2,
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
    expect(repository.findCustomerOrderDetail).toHaveBeenCalledWith(
      'order_1',
      'cust_prof_1',
    );
    expect(
      menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts,
    ).toHaveBeenCalledWith(
      [
        {
          menuItemId: 'item_1',
          quantity: 2,
          menuItemStockTrackedSnapshot: true,
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
    expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
      status: OrderStatus.CANCELLED,
      fromStatus: OrderStatus.PLACED,
      changedByUserId: 'usr_customer_1',
      reasonCode: 'customer_changed_mind',
      note: 'Wrong address',
    }, expect.anything());
    expect(
      notificationEventService.publishMerchantInventoryCompensationAlert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'item_1',
        restoredQuantity: 2,
        orderCode: 'ORD-00000001',
        reasonCode: 'customer_changed_mind',
      }),
    );
    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('returns the current order when the customer retries cancelling an already cancelled order', async () => {
    const { repository, queryService, service } = makeService();
    const cancelledOrder = makeOrderDetail({
      status: OrderStatus.CANCELLED,
      availableActions: [],
    });

    repository.findCustomerOrderDetail.mockResolvedValue({
      status: OrderStatus.CANCELLED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(cancelledOrder);
    queryService.attachAvailableActions.mockImplementation(
      (_currentUser, order) => order,
    );

    const result = await service.cancelCurrentCustomerOrder(currentUser, {
      orderId: 'order_1',
    });

    expect(repository.updateOrderStatus).not.toHaveBeenCalled();
    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('rejects cancellation when the order is no longer customer-cancellable', async () => {
    const { repository, queryService, service } = makeService();
    const deliveredOrder = makeOrderDetail({
      status: OrderStatus.DELIVERED,
      availableActions: [],
    });

    repository.findCustomerOrderDetail.mockResolvedValue({
      status: OrderStatus.DELIVERED,
    } as never);
    queryService.buildOrderDetail.mockReturnValue(deliveredOrder);

    await expect(
      service.cancelCurrentCustomerOrder(currentUser, {
        orderId: 'order_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });

  it('rejects cancellation when the scoped customer order cannot be found', async () => {
    const { repository, service } = makeService();

    repository.findCustomerOrderDetail.mockResolvedValue(null);

    await expect(
      service.cancelCurrentCustomerOrder(currentUser, {
        orderId: 'order_missing',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });
});
