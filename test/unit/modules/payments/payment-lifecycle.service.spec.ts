import { HttpStatus } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../../../src/modules/menus/services/menu-inventory-lifecycle.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';
import { PaymentsRepository } from '../../../../src/modules/payments/repositories/payments.repository';
import { PaymentLifecycleService } from '../../../../src/modules/payments/services/payment-lifecycle.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

function makePaymentRecord(overrides?: Record<string, unknown>): any {
  return {
    id: 'payment_1',
    orderId: 'order_1',
    customerProfileId: 'cust_prof_1',
    method: PaymentMethod.CARD,
    provider: PaymentProvider.STRIPE,
    status: PaymentStatus.REQUIRES_ACTION,
    amount: new Prisma.Decimal('6500'),
    refundedAmount: new Prisma.Decimal('0'),
    currencyCode: 'MMK',
    idempotencyKey: 'idem_1',
    providerReference: null,
    providerReceiptId: null,
    failureCode: null,
    failureMessage: null,
    metadataJson: {
      initiatedFrom: 'checkout',
    },
    requiresActionAt: new Date('2026-04-24T08:00:00.000Z'),
    succeededAt: null,
    failedAt: null,
    cancelledAt: null,
    expiredAt: null,
    createdAt: new Date('2026-04-24T08:00:00.000Z'),
    updatedAt: new Date('2026-04-24T08:00:00.000Z'),
    customerProfile: {
      id: 'cust_prof_1',
      fullName: 'Mg Mg',
      avatarUrl: null,
      user: {
        id: 'usr_customer_1',
        phone: '09123456789',
        status: UserStatus.ACTIVE,
      },
    },
    order: {
      id: 'order_1',
      orderCode: 'ORD-001',
      status: OrderStatus.PLACED,
      totalAmount: new Prisma.Decimal('6500'),
      currencyCode: 'MMK',
      placedAt: new Date('2026-04-24T08:00:00.000Z'),
      branch: {
        id: 'branch_1',
        name: 'Downtown Branch',
        merchant: {
          id: 'merchant_1',
          userId: 'usr_merchant_1',
          name: 'Demo Merchant',
        },
      },
    },
    refunds: [],
    ...overrides,
  };
}

describe('PaymentLifecycleService', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_admin_1',
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const makePrismaService = () =>
    ({
      runInTransaction: jest.fn(
        async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          callback({} as Prisma.TransactionClient),
      ),
    } as unknown as jest.Mocked<PrismaService>);

  const makePaymentsRepository = () =>
    ({
      findById: jest.fn(),
      transitionPaymentStatus: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>);

  const makeOrdersRepository = () =>
    ({
      findOrderDetailById: jest.fn(),
      updateOrderStatus: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>);

  const makeSystemMessageService = () =>
    ({
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SystemMessageService>);

  const makeMenuInventoryLifecycleService = () =>
    ({
      restoreTrackedInventoryForOrder: jest.fn().mockResolvedValue(undefined),
      collectTrackedInventoryRestorationAlerts: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<MenuInventoryLifecycleService>);

  const makeNotificationEventService = () =>
    ({
      publishMerchantInventoryCompensationAlert: jest
        .fn()
        .mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationEventService>);

  it('confirms an eligible payment and publishes a payment success system event', async () => {
    const prisma = makePrismaService();
    const paymentsRepository = makePaymentsRepository();
    const ordersRepository = makeOrdersRepository();
    const systemMessageService = makeSystemMessageService();
    const menuInventoryLifecycleService = makeMenuInventoryLifecycleService();
    const notificationEventService = makeNotificationEventService();
    const service = new PaymentLifecycleService(
      prisma,
      paymentsRepository,
      ordersRepository,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
    );

    paymentsRepository.findById
      .mockResolvedValueOnce(makePaymentRecord() as never)
      .mockResolvedValueOnce(
        makePaymentRecord({
          status: PaymentStatus.SUCCEEDED,
          providerReference: 'pi_123',
          providerReceiptId: 'receipt_123',
          succeededAt: new Date('2026-04-24T08:10:00.000Z'),
          requiresActionAt: null,
        }) as never,
      );
    paymentsRepository.transitionPaymentStatus.mockResolvedValue(
      makePaymentRecord({
        status: PaymentStatus.SUCCEEDED,
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
        succeededAt: new Date('2026-04-24T08:10:00.000Z'),
        requiresActionAt: null,
      }) as never,
    );

    const result = await service.confirmCurrentPayment(currentUser, {
      paymentId: 'payment_1',
      providerReference: 'pi_123',
      providerReceiptId: 'receipt_123',
      responsePayloadJson: { providerStatus: 'succeeded' },
    });

    expect(paymentsRepository.transitionPaymentStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: 'payment_1',
        status: PaymentStatus.SUCCEEDED,
        providerReference: 'pi_123',
        providerReceiptId: 'receipt_123',
      }),
      expect.anything(),
    );
    expect(ordersRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'PAYMENT_SUCCEEDED',
      }),
    );
    expect(result).toMatchObject({
      paymentId: 'payment_1',
      status: PaymentStatus.SUCCEEDED,
      providerReference: 'pi_123',
      providerReceiptId: 'receipt_123',
    });
  });

  it('fails an unpaid external payment, auto-cancels the placed order, and publishes both system events', async () => {
    const prisma = makePrismaService();
    const paymentsRepository = makePaymentsRepository();
    const ordersRepository = makeOrdersRepository();
    const systemMessageService = makeSystemMessageService();
    const menuInventoryLifecycleService = makeMenuInventoryLifecycleService();
    const notificationEventService = makeNotificationEventService();
    const service = new PaymentLifecycleService(
      prisma,
      paymentsRepository,
      ordersRepository,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
    );

    paymentsRepository.findById
      .mockResolvedValueOnce(makePaymentRecord() as never)
      .mockResolvedValueOnce(
        makePaymentRecord({
          status: PaymentStatus.FAILED,
          failureCode: 'provider_declined',
          failureMessage: 'Card was declined.',
          failedAt: new Date('2026-04-24T08:12:00.000Z'),
          order: {
            ...makePaymentRecord().order,
            status: OrderStatus.CANCELLED,
          },
        }) as never,
      );
    paymentsRepository.transitionPaymentStatus.mockResolvedValue(
      makePaymentRecord({
        status: PaymentStatus.FAILED,
        failureCode: 'provider_declined',
        failureMessage: 'Card was declined.',
        failedAt: new Date('2026-04-24T08:12:00.000Z'),
      }) as never,
    );
    ordersRepository.findOrderDetailById.mockResolvedValue({
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
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);
    menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts.mockResolvedValue([
      {
        merchantUserId: 'usr_merchant_1',
        branchId: 'branch_1',
        branchName: 'Downtown Branch',
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        resourceLabel: 'Mohinga',
        restoredQuantity: 2,
        stockQuantity: 5,
        lowStockThreshold: 3,
      },
    ]);

    const result = await service.failCurrentPayment(currentUser, {
      paymentId: 'payment_1',
      failureCode: 'provider_declined',
      failureMessage: 'Card was declined.',
      reasonCode: 'provider_declined',
      note: 'Customer should retry with another card.',
    });

    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      {
        status: OrderStatus.CANCELLED,
        fromStatus: OrderStatus.PLACED,
        changedByUserId: 'usr_admin_1',
        reasonCode: 'provider_declined',
        note: 'Customer should retry with another card.',
      },
      expect.anything(),
    );
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
    expect(
      notificationEventService.publishMerchantInventoryCompensationAlert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'item_1',
        restoredQuantity: 2,
        orderCode: 'ORD-001',
        reasonCode: 'provider_declined',
      }),
    );
    expect(systemMessageService.publishOrderEvent).toHaveBeenNthCalledWith(
      1,
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'PAYMENT_FAILED',
      }),
    );
    expect(systemMessageService.publishOrderEvent).toHaveBeenNthCalledWith(
      2,
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'ORDER_CANCELLED',
      }),
    );
    expect(result).toMatchObject({
      paymentId: 'payment_1',
      status: PaymentStatus.FAILED,
      order: {
        status: OrderStatus.CANCELLED,
      },
    });
  });

  it('cancels an eligible payment without auto-cancelling an already accepted order', async () => {
    const prisma = makePrismaService();
    const paymentsRepository = makePaymentsRepository();
    const ordersRepository = makeOrdersRepository();
    const systemMessageService = makeSystemMessageService();
    const menuInventoryLifecycleService = makeMenuInventoryLifecycleService();
    const notificationEventService = makeNotificationEventService();
    const service = new PaymentLifecycleService(
      prisma,
      paymentsRepository,
      ordersRepository,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
    );

    paymentsRepository.findById.mockResolvedValueOnce(
      makePaymentRecord({
        status: PaymentStatus.PENDING,
        method: PaymentMethod.MANUAL,
        provider: PaymentProvider.MANUAL,
        order: {
          ...makePaymentRecord().order,
          status: OrderStatus.MERCHANT_ACCEPTED,
        },
      }) as never,
    );
    paymentsRepository.transitionPaymentStatus.mockResolvedValue(
      makePaymentRecord({
        status: PaymentStatus.CANCELLED,
        method: PaymentMethod.MANUAL,
        provider: PaymentProvider.MANUAL,
        cancelledAt: new Date('2026-04-24T08:15:00.000Z'),
        order: {
          ...makePaymentRecord().order,
          status: OrderStatus.MERCHANT_ACCEPTED,
        },
      }) as never,
    );

    const result = await service.cancelCurrentPayment(currentUser, {
      paymentId: 'payment_1',
      note: 'Customer cancelled bank transfer.',
    });

    expect(ordersRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledTimes(1);
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        code: 'PAYMENT_CANCELLED',
      }),
    );
    expect(result.status).toBe(PaymentStatus.CANCELLED);
  });

  it('returns the current payment when the same target transition is retried', async () => {
    const paymentsRepository = makePaymentsRepository();
    paymentsRepository.findById.mockResolvedValue(
      makePaymentRecord({
        status: PaymentStatus.SUCCEEDED,
      }) as never,
    );

    const noOpService = new PaymentLifecycleService(
      makePrismaService(),
      paymentsRepository,
      makeOrdersRepository(),
      makeSystemMessageService(),
      makeMenuInventoryLifecycleService(),
      makeNotificationEventService(),
    );

    const result = await noOpService.confirmCurrentPayment(currentUser, {
      paymentId: 'payment_1',
    });

    expect(paymentsRepository.transitionPaymentStatus).not.toHaveBeenCalled();
    expect(result.status).toBe(PaymentStatus.SUCCEEDED);
  });

  it('expires provider payments through trusted internal lifecycle calls', async () => {
    const prisma = makePrismaService();
    const paymentsRepository = makePaymentsRepository();
    const ordersRepository = makeOrdersRepository();
    const systemMessageService = makeSystemMessageService();
    const menuInventoryLifecycleService = makeMenuInventoryLifecycleService();
    const notificationEventService = makeNotificationEventService();
    const service = new PaymentLifecycleService(
      prisma,
      paymentsRepository,
      ordersRepository,
      systemMessageService,
      menuInventoryLifecycleService,
      notificationEventService,
    );
    const systemActor = makeAuthenticatedUser({
      userId: 'system:payment-provider-webhook',
      sessionId: 'system:payment-provider-webhook',
      role: UserRole.SUPPORT,
      actorContext: {
        userId: 'system:payment-provider-webhook',
        phone: 'system',
        role: UserRole.SUPPORT,
        status: UserStatus.ACTIVE,
      },
    });

    paymentsRepository.findById
      .mockResolvedValueOnce(
        makePaymentRecord({
          status: PaymentStatus.PROCESSING,
        }) as never,
      )
      .mockResolvedValueOnce(
        makePaymentRecord({
          status: PaymentStatus.EXPIRED,
          expiredAt: new Date('2026-04-24T08:20:00.000Z'),
          order: {
            ...makePaymentRecord().order,
            status: OrderStatus.CANCELLED,
          },
        }) as never,
      );
    paymentsRepository.transitionPaymentStatus.mockResolvedValue(
      makePaymentRecord({
        status: PaymentStatus.EXPIRED,
        expiredAt: new Date('2026-04-24T08:20:00.000Z'),
      }) as never,
    );
    ordersRepository.findOrderDetailById.mockResolvedValue({
      status: OrderStatus.PLACED,
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
    ordersRepository.updateOrderStatus.mockResolvedValue({} as never);
    menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts.mockResolvedValue([
      {
        merchantUserId: 'usr_merchant_1',
        branchId: 'branch_1',
        branchName: 'Downtown Branch',
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        resourceLabel: 'Mohinga',
        restoredQuantity: 1,
        stockQuantity: 4,
        lowStockThreshold: 3,
      },
    ]);

    const result = await service.expireCurrentPayment(
      systemActor,
      {
        paymentId: 'payment_1',
        reasonCode: 'provider_payment_expired',
        note: 'Provider reported payment expiration.',
      },
      {
        skipAdminFinanceAccess: true,
      },
    );

    expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order_1',
      {
        status: OrderStatus.CANCELLED,
        fromStatus: OrderStatus.PLACED,
        changedByUserId: 'system:payment-provider-webhook',
        reasonCode: 'provider_payment_expired',
        note: 'Provider reported payment expiration.',
      },
      expect.anything(),
    );
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      systemActor,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'PAYMENT_CANCELLED',
      }),
    );
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
        orderCode: 'ORD-001',
        reasonCode: 'provider_payment_expired',
      }),
    );
    expect(result.status).toBe(PaymentStatus.EXPIRED);
  });

  it('rejects payment lifecycle operations for non-admin actors', async () => {
    const paymentsRepository = makePaymentsRepository();
    const service = new PaymentLifecycleService(
      makePrismaService(),
      paymentsRepository,
      makeOrdersRepository(),
      makeSystemMessageService(),
      makeMenuInventoryLifecycleService(),
      makeNotificationEventService(),
    );

    await expect(
      service.confirmCurrentPayment(makeAuthenticatedUser(), {
        paymentId: 'payment_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
    });
    expect(paymentsRepository.findById).not.toHaveBeenCalled();
  });

  it('rejects invalid confirmation transitions once a payment has already failed', async () => {
    const paymentsRepository = makePaymentsRepository();
    paymentsRepository.findById.mockResolvedValue(
      makePaymentRecord({
        status: PaymentStatus.FAILED,
        failureCode: 'provider_declined',
      }) as never,
    );
    const service = new PaymentLifecycleService(
      makePrismaService(),
      paymentsRepository,
      makeOrdersRepository(),
      makeSystemMessageService(),
      makeMenuInventoryLifecycleService(),
      makeNotificationEventService(),
    );

    await expect(
      service.confirmCurrentPayment(currentUser, {
        paymentId: 'payment_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
    });
  });
});
