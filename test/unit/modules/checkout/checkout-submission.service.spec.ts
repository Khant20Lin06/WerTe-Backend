import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  CartStatus,
  ItemOptionGroupKind,
  MerchantStatus,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { CartsRepository } from '../../../../src/modules/carts/repositories/carts.repository';
import { CheckoutContextEntity } from '../../../../src/modules/checkout/entities/checkout-context.entity';
import { CheckoutContextService } from '../../../../src/modules/checkout/services/checkout-context.service';
import { CheckoutPricingService } from '../../../../src/modules/checkout/services/checkout-pricing.service';
import { CheckoutSubmissionService } from '../../../../src/modules/checkout/services/checkout-submission.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { MenuInventoryLifecycleService } from '../../../../src/modules/menus/services/menu-inventory-lifecycle.service';
import { MenusService } from '../../../../src/modules/menus/services/menus.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { OrdersRepository } from '../../../../src/modules/orders/repositories/orders.repository';
import { CheckoutPaymentIntentService } from '../../../../src/modules/payments/services/checkout-payment-intent.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

function makeCheckoutContext(
  overrides?: Partial<CheckoutContextEntity>,
): CheckoutContextEntity {
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
      merchantStatus: MerchantStatus.ACTIVE,
      branchName: 'Downtown Branch',
      township: 'Botahtaung',
      branchStatus: BranchStatus.ACTIVE,
    },
    cart: {
      cartId: 'cart_1',
      customerProfileId: 'cust_prof_1',
      branchId: 'branch_1',
      merchantId: 'merchant_1',
      branchName: 'Downtown Branch',
      branchStatus: BranchStatus.ACTIVE,
      merchantStatus: MerchantStatus.ACTIVE,
      status: CartStatus.ACTIVE,
      totalQuantity: 2,
      subtotalAmount: '6500',
      totalAmount: '6500',
      isEmpty: false,
      items: [
        {
          cartItemId: 'cart_item_1',
          menuItemId: 'item_1',
          branchId: 'branch_1',
          categoryId: 'cat_1',
          menuItemName: 'Mohinga',
          menuItemDescription: 'Breakfast item',
          menuItemImageUrl: null,
          menuItemBasePrice: '2500',
          menuItemIsAvailable: true,
          quantity: 2,
          unitPriceSnapshot: '3250',
          lineTotal: '6500',
          selectedOptions: [
            {
              cartItemOptionId: 'cart_item_option_1',
              itemOptionId: 'option_1',
              itemOptionName: 'Extra fish cake',
              itemOptionIsActive: true,
              optionGroupId: 'group_1',
              optionGroupName: 'Choose extras',
              optionGroupIsActive: true,
              nameSnapshot: 'Extra fish cake',
              priceDeltaSnapshot: '750',
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

function makeSubmissionRecord(overrides?: Record<string, unknown>) {
  return {
    id: 'order_1',
    orderCode: 'ORD-00000001',
    customerProfileId: 'cust_prof_1',
    branchId: 'branch_1',
    addressId: 'addr_1',
    cartId: 'cart_1',
    idempotencyKey: 'idem_1',
    status: OrderStatus.PLACED,
    currencyCode: 'MMK',
    subtotalAmount: new Prisma.Decimal('6500'),
    discountAmount: new Prisma.Decimal('0'),
    deliveryFee: new Prisma.Decimal('0'),
    totalAmount: new Prisma.Decimal('6500'),
    placedAt: new Date('2026-04-19T10:00:00.000Z'),
    ...overrides,
  };
}

function makePaymentIntentRecord(overrides?: Record<string, unknown>) {
  return {
    paymentId: 'payment_1',
    orderId: 'order_1',
    customerProfileId: 'cust_prof_1',
    method: PaymentMethod.CASH_ON_DELIVERY,
    provider: PaymentProvider.COD,
    status: PaymentStatus.PENDING,
    amount: '6500',
    currencyCode: 'MMK',
    idempotencyKey: 'idem_1',
    providerReference: null,
    providerReceiptId: null,
    failureCode: null,
    failureMessage: null,
    requiresActionAt: null,
    succeededAt: null,
    failedAt: null,
    cancelledAt: null,
    expiredAt: null,
    requiresCustomerAction: false,
    createdAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-19T10:00:00.000Z',
    ...overrides,
  };
}

describe('CheckoutSubmissionService', () => {
  const currentUser = makeAuthenticatedUser({
    actorContext: {
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  });

  const makePrismaService = () =>
    ({
      runInTransaction: jest.fn(
        async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
          callback({} as Prisma.TransactionClient),
      ),
    } as unknown as PrismaService);

  const makeSystemMessageService = () =>
    ({
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SystemMessageService>);

  const makeCheckoutPaymentIntentService = () =>
    ({
      createCheckoutPaymentIntent: jest
        .fn()
        .mockResolvedValue(makePaymentIntentRecord()),
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<CheckoutPaymentIntentService>);

  const makeMenusService = () =>
    ({
      listItemsByIds: jest.fn().mockResolvedValue([
        { id: 'item_1', isStockTracked: true },
      ]),
      listOptionsByBranchId: jest.fn().mockResolvedValue([
        {
          id: 'option_1',
          isStockTracked: true,
          group: { id: 'group_1', kind: ItemOptionGroupKind.ADD_ON },
        },
      ]),
      listVariantCombinationsByMenuItemIds: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<MenusService>);

  const makeMenuInventoryLifecycleService = () =>
    ({
      reserveTrackedInventoryForOrder: jest.fn().mockResolvedValue({
        alerts: [],
        inventoryLotAllocationsByLineKey: {},
      }),
    } as unknown as jest.Mocked<MenuInventoryLifecycleService>);

  const makeNotificationEventService = () =>
    ({
      publishMerchantInventoryAlert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationEventService>);

  const makeCheckoutPricingService = (
    overrides?: Partial<
      Awaited<ReturnType<CheckoutPricingService['buildPricingBreakdown']>>
    >,
  ) =>
    ({
      buildPricingBreakdown: jest.fn().mockResolvedValue({
        subtotalAmount: new Prisma.Decimal('6500'),
        discountAmount: new Prisma.Decimal('0'),
        deliveryFee: new Prisma.Decimal('0'),
        totalAmount: new Prisma.Decimal('6500'),
        appliedPromotion: null,
        ...overrides,
      }),
    }) as unknown as jest.Mocked<CheckoutPricingService>;

  it('creates an order, initializes the checkout payment intent, marks the cart checked out, and queues timeout handling', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const ordersRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      createCheckoutOrder: jest.fn().mockResolvedValue(makeSubmissionRecord()),
    } as unknown as jest.Mocked<OrdersRepository>;
    const cartsRepository = {
      updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
    } as unknown as jest.Mocked<CartsRepository>;
    const queueService = {
      add: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueueService>;
    const checkoutPaymentIntentService = makeCheckoutPaymentIntentService();
    const systemMessageService = makeSystemMessageService();
    const menuInventoryLifecycleService = {
      reserveTrackedInventoryForOrder: jest.fn().mockResolvedValue({
        alerts: [
          {
            merchantUserId: 'usr_merchant_1',
            branchId: 'branch_1',
            branchName: null,
            resourceType: 'MENU_ITEM',
            resourceId: 'item_1',
            resourceLabel: 'Mohinga',
            attentionLevel: 'LOW_STOCK',
            stockQuantity: 3,
            lowStockThreshold: 3,
          },
        ],
        inventoryLotAllocationsByLineKey: {
          cart_item_1: [
            {
              inventoryLotId: 'lot_1',
              batchNoSnapshot: 'BATCH-001',
              expiryDateSnapshot: '2026-05-30T00:00:00.000Z',
              quantity: 2,
            },
          ],
        },
      }),
    } as unknown as jest.Mocked<MenuInventoryLifecycleService>;
    const notificationEventService = makeNotificationEventService();
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      cartsRepository,
      makeMenusService(),
      menuInventoryLifecycleService,
      checkoutPaymentIntentService,
      queueService,
      systemMessageService,
      notificationEventService,
    );

    const result = await service.submitCurrentCustomerCheckout(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'idem_1',
    });

    expect(ordersRepository.createCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        addressId: 'addr_1',
        cartId: 'cart_1',
        idempotencyKey: 'idem_1',
        status: OrderStatus.PLACED,
        currencyCode: 'MMK',
        cartItems: [
          expect.objectContaining({
            menuItemId: 'item_1',
            quantity: 2,
            menuItemStockTrackedSnapshot: true,
            inventoryLotAllocations: [
              expect.objectContaining({
                inventoryLotId: 'lot_1',
                batchNoSnapshot: 'BATCH-001',
                expiryDateSnapshot: '2026-05-30T00:00:00.000Z',
                quantity: 2,
              }),
            ],
            selectedOptions: [
              expect.objectContaining({
                itemOptionId: 'option_1',
                optionGroupId: 'group_1',
                optionGroupKindSnapshot: ItemOptionGroupKind.ADD_ON,
                itemOptionStockTrackedSnapshot: true,
              }),
            ],
          }),
        ],
      }),
      expect.anything(),
    );
    expect(
      menuInventoryLifecycleService.reserveTrackedInventoryForOrder,
    ).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          menuItemId: 'item_1',
          quantity: 2,
          menuItemStockTrackedSnapshot: true,
          selectedOptions: [
            expect.objectContaining({
              itemOptionId: 'option_1',
              itemOptionStockTrackedSnapshot: true,
            }),
          ],
        }),
      ],
      expect.anything(),
    );
    expect(
      checkoutPaymentIntentService.createCheckoutPaymentIntent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        customerProfileId: 'cust_prof_1',
        idempotencyKey: 'idem_1',
        paymentMethod: undefined,
        paymentProvider: undefined,
      }),
      expect.anything(),
    );
    expect(cartsRepository.updateCart).toHaveBeenCalledWith(
      'cart_1',
      {
        status: CartStatus.CHECKED_OUT,
      },
      expect.anything(),
    );
    expect(queueService.add).toHaveBeenCalledWith(
      'order-timeouts',
      'start-timeout',
      {
        orderId: 'order_1',
      },
    );
    expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
        code: 'ORDER_PLACED',
      }),
    );
    expect(
      notificationEventService.publishMerchantInventoryAlert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        attentionLevel: 'LOW_STOCK',
      }),
    );
    expect(result).toMatchObject({
      orderId: 'order_1',
      status: OrderStatus.PLACED,
      isIdempotentReplay: false,
      totalAmount: '6500',
      paymentIntent: {
        paymentId: 'payment_1',
        provider: PaymentProvider.COD,
        status: PaymentStatus.PENDING,
      },
    });
  });

  it('returns an existing order and existing payment intent for a replayed idempotency key without creating duplicates', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const ordersRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(makeSubmissionRecord()),
      createCheckoutOrder: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;
    const cartsRepository = {
      updateCart: jest.fn(),
    } as unknown as jest.Mocked<CartsRepository>;
    const queueService = {
      add: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const checkoutPaymentIntentService = {
      findByIdempotencyKey: jest
        .fn()
        .mockResolvedValue(makePaymentIntentRecord()),
      createCheckoutPaymentIntent: jest.fn(),
    } as unknown as jest.Mocked<CheckoutPaymentIntentService>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      cartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      checkoutPaymentIntentService,
      queueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    const result = await service.submitCurrentCustomerCheckout(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'idem_1',
    });

    expect(ordersRepository.createCheckoutOrder).not.toHaveBeenCalled();
    expect(
      checkoutPaymentIntentService.findByIdempotencyKey,
    ).toHaveBeenCalledWith('idem_1', expect.anything());
    expect(
      checkoutPaymentIntentService.createCheckoutPaymentIntent,
    ).not.toHaveBeenCalled();
    expect(cartsRepository.updateCart).not.toHaveBeenCalled();
    expect(queueService.add).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      orderId: 'order_1',
      isIdempotentReplay: true,
      paymentIntent: {
        paymentId: 'payment_1',
      },
    });
  });

  it('creates a missing payment intent when replaying an older order without one', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const ordersRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(makeSubmissionRecord()),
      createCheckoutOrder: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;
    const checkoutPaymentIntentService = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      createCheckoutPaymentIntent: jest
        .fn()
        .mockResolvedValue(makePaymentIntentRecord({ paymentId: 'payment_legacy' })),
    } as unknown as jest.Mocked<CheckoutPaymentIntentService>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      {} as CartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      checkoutPaymentIntentService,
      {} as QueueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    const result = await service.submitCurrentCustomerCheckout(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'idem_1',
    });

    expect(
      checkoutPaymentIntentService.createCheckoutPaymentIntent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order_1',
        customerProfileId: 'cust_prof_1',
        idempotencyKey: 'idem_1',
      }),
      expect.anything(),
    );
    expect(result).toMatchObject({
      isIdempotentReplay: true,
      paymentIntent: {
        paymentId: 'payment_legacy',
      },
    });
  });

  it('rejects a replayed idempotency key when it belongs to another customer profile', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const ordersRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(
        makeSubmissionRecord({
          customerProfileId: 'cust_prof_2',
        }),
      ),
    } as unknown as jest.Mocked<OrdersRepository>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      {} as CartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      makeCheckoutPaymentIntentService(),
      {} as QueueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    await expect(
      service.submitCurrentCustomerCheckout(currentUser, {
        branchId: 'branch_1',
        addressId: 'addr_1',
        idempotencyKey: 'idem_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
      }),
    });
  });

  it('returns an idempotent replay when a concurrent unique constraint conflict occurs on create', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`idempotencyKey`)',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          target: ['idempotencyKey'],
        },
      },
    );
    const ordersRepository = {
      findByIdempotencyKey: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(makeSubmissionRecord()),
      createCheckoutOrder: jest.fn().mockRejectedValue(uniqueConstraintError),
    } as unknown as jest.Mocked<OrdersRepository>;
    const checkoutPaymentIntentService = {
      findByIdempotencyKey: jest
        .fn()
        .mockResolvedValue(makePaymentIntentRecord({ paymentId: 'payment_2' })),
      createCheckoutPaymentIntent: jest.fn(),
    } as unknown as jest.Mocked<CheckoutPaymentIntentService>;
    const cartsRepository = {
      updateCart: jest.fn(),
    } as unknown as jest.Mocked<CartsRepository>;
    const queueService = {
      add: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      cartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      checkoutPaymentIntentService,
      queueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    const result = await service.submitCurrentCustomerCheckout(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'idem_1',
    });

    expect(ordersRepository.findByIdempotencyKey).toHaveBeenCalledTimes(2);
    expect(cartsRepository.updateCart).not.toHaveBeenCalled();
    expect(queueService.add).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      orderId: 'order_1',
      isIdempotentReplay: true,
      paymentIntent: {
        paymentId: 'payment_2',
      },
    });
  });

  it('rethrows a unique constraint error when the conflicting target is not the checkout idempotency key', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`orderCode`)',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          target: ['orderCode'],
        },
      },
    );
    const ordersRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      createCheckoutOrder: jest.fn().mockRejectedValue(uniqueConstraintError),
    } as unknown as jest.Mocked<OrdersRepository>;
    const cartsRepository = {
      updateCart: jest.fn(),
    } as unknown as jest.Mocked<CartsRepository>;
    const queueService = {
      add: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      cartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      makeCheckoutPaymentIntentService(),
      queueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    await expect(
      service.submitCurrentCustomerCheckout(currentUser, {
        branchId: 'branch_1',
        addressId: 'addr_1',
        idempotencyKey: 'idem_1',
      }),
    ).rejects.toBe(uniqueConstraintError);

    expect(ordersRepository.findByIdempotencyKey).toHaveBeenCalledTimes(1);
    expect(cartsRepository.updateCart).not.toHaveBeenCalled();
    expect(queueService.add).not.toHaveBeenCalled();
  });

  it('rejects a concurrent idempotency replay when the conflicting order belongs to another customer profile', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`idempotencyKey`)',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          target: ['idempotencyKey'],
        },
      },
    );
    const ordersRepository = {
      findByIdempotencyKey: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          makeSubmissionRecord({
            customerProfileId: 'cust_prof_2',
          }),
        ),
      createCheckoutOrder: jest.fn().mockRejectedValue(uniqueConstraintError),
    } as unknown as jest.Mocked<OrdersRepository>;
    const cartsRepository = {
      updateCart: jest.fn(),
    } as unknown as jest.Mocked<CartsRepository>;
    const queueService = {
      add: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      cartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      makeCheckoutPaymentIntentService(),
      queueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    await expect(
      service.submitCurrentCustomerCheckout(currentUser, {
        branchId: 'branch_1',
        addressId: 'addr_1',
        idempotencyKey: 'idem_1',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
      }),
    });

    expect(ordersRepository.findByIdempotencyKey).toHaveBeenCalledTimes(2);
    expect(cartsRepository.updateCart).not.toHaveBeenCalled();
    expect(queueService.add).not.toHaveBeenCalled();
  });

  it('creates a REQUIRES_ACTION payment intent for non-COD checkout methods', async () => {
    const checkoutContextService = {
      getValidatedCurrentCustomerCheckoutContext: jest
        .fn()
        .mockResolvedValue(makeCheckoutContext()),
    } as unknown as jest.Mocked<CheckoutContextService>;
    const ordersRepository = {
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
      createCheckoutOrder: jest.fn().mockResolvedValue(makeSubmissionRecord()),
    } as unknown as jest.Mocked<OrdersRepository>;
    const cartsRepository = {
      updateCart: jest.fn().mockResolvedValue({ id: 'cart_1' }),
    } as unknown as jest.Mocked<CartsRepository>;
    const queueService = {
      add: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueueService>;
    const checkoutPaymentIntentService = {
      createCheckoutPaymentIntent: jest.fn().mockResolvedValue(
        makePaymentIntentRecord({
          paymentId: 'payment_3',
          method: PaymentMethod.CARD,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.REQUIRES_ACTION,
          requiresCustomerAction: true,
          requiresActionAt: '2026-04-19T10:00:00.000Z',
        }),
      ),
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<CheckoutPaymentIntentService>;
    const service = new CheckoutSubmissionService(
      makePrismaService(),
      checkoutContextService,
      makeCheckoutPricingService(),
      ordersRepository,
      cartsRepository,
      makeMenusService(),
      makeMenuInventoryLifecycleService(),
      checkoutPaymentIntentService,
      queueService,
      makeSystemMessageService(),
      makeNotificationEventService(),
    );

    const result = await service.submitCurrentCustomerCheckout(currentUser, {
      branchId: 'branch_1',
      addressId: 'addr_1',
      idempotencyKey: 'idem_1',
      paymentMethod: PaymentMethod.CARD,
      paymentProvider: PaymentProvider.STRIPE,
    });

    expect(
      checkoutPaymentIntentService.createCheckoutPaymentIntent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: PaymentMethod.CARD,
        paymentProvider: PaymentProvider.STRIPE,
      }),
      expect.anything(),
    );
    expect(result).toMatchObject({
      paymentIntent: {
        paymentId: 'payment_3',
        method: PaymentMethod.CARD,
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.REQUIRES_ACTION,
        requiresCustomerAction: true,
      },
    });
  });
});
