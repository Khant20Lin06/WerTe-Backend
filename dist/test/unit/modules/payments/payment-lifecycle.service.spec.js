"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const payment_lifecycle_service_1 = require("../../../../src/modules/payments/services/payment-lifecycle.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
function makePaymentRecord(overrides) {
    return {
        id: 'payment_1',
        orderId: 'order_1',
        customerProfileId: 'cust_prof_1',
        method: client_1.PaymentMethod.CARD,
        provider: client_1.PaymentProvider.STRIPE,
        status: client_1.PaymentStatus.REQUIRES_ACTION,
        amount: new client_1.Prisma.Decimal('6500'),
        refundedAmount: new client_1.Prisma.Decimal('0'),
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
                status: client_1.UserStatus.ACTIVE,
            },
        },
        order: {
            id: 'order_1',
            orderCode: 'ORD-001',
            status: client_1.OrderStatus.PLACED,
            totalAmount: new client_1.Prisma.Decimal('6500'),
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
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_admin_1',
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '099999999',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const makePrismaService = () => ({
        runInTransaction: jest.fn(async (callback) => callback({})),
    });
    const makePaymentsRepository = () => ({
        findById: jest.fn(),
        transitionPaymentStatus: jest.fn(),
    });
    const makeOrdersRepository = () => ({
        findOrderDetailById: jest.fn(),
        updateOrderStatus: jest.fn(),
    });
    const makeSystemMessageService = () => ({
        publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    });
    const makeMenuInventoryLifecycleService = () => ({
        restoreTrackedInventoryForOrder: jest.fn().mockResolvedValue(undefined),
        collectTrackedInventoryRestorationAlerts: jest.fn().mockResolvedValue([]),
    });
    const makeNotificationEventService = () => ({
        publishMerchantInventoryCompensationAlert: jest
            .fn()
            .mockResolvedValue(undefined),
    });
    it('confirms an eligible payment and publishes a payment success system event', async () => {
        const prisma = makePrismaService();
        const paymentsRepository = makePaymentsRepository();
        const ordersRepository = makeOrdersRepository();
        const systemMessageService = makeSystemMessageService();
        const menuInventoryLifecycleService = makeMenuInventoryLifecycleService();
        const notificationEventService = makeNotificationEventService();
        const service = new payment_lifecycle_service_1.PaymentLifecycleService(prisma, paymentsRepository, ordersRepository, systemMessageService, menuInventoryLifecycleService, notificationEventService);
        paymentsRepository.findById
            .mockResolvedValueOnce(makePaymentRecord())
            .mockResolvedValueOnce(makePaymentRecord({
            status: client_1.PaymentStatus.SUCCEEDED,
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            succeededAt: new Date('2026-04-24T08:10:00.000Z'),
            requiresActionAt: null,
        }));
        paymentsRepository.transitionPaymentStatus.mockResolvedValue(makePaymentRecord({
            status: client_1.PaymentStatus.SUCCEEDED,
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            succeededAt: new Date('2026-04-24T08:10:00.000Z'),
            requiresActionAt: null,
        }));
        const result = await service.confirmCurrentPayment(currentUser, {
            paymentId: 'payment_1',
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
            responsePayloadJson: { providerStatus: 'succeeded' },
        });
        expect(paymentsRepository.transitionPaymentStatus).toHaveBeenCalledWith(expect.objectContaining({
            paymentId: 'payment_1',
            status: client_1.PaymentStatus.SUCCEEDED,
            providerReference: 'pi_123',
            providerReceiptId: 'receipt_123',
        }), expect.anything());
        expect(ordersRepository.updateOrderStatus).not.toHaveBeenCalled();
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'PAYMENT_SUCCEEDED',
        }));
        expect(result).toMatchObject({
            paymentId: 'payment_1',
            status: client_1.PaymentStatus.SUCCEEDED,
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
        const service = new payment_lifecycle_service_1.PaymentLifecycleService(prisma, paymentsRepository, ordersRepository, systemMessageService, menuInventoryLifecycleService, notificationEventService);
        paymentsRepository.findById
            .mockResolvedValueOnce(makePaymentRecord())
            .mockResolvedValueOnce(makePaymentRecord({
            status: client_1.PaymentStatus.FAILED,
            failureCode: 'provider_declined',
            failureMessage: 'Card was declined.',
            failedAt: new Date('2026-04-24T08:12:00.000Z'),
            order: {
                ...makePaymentRecord().order,
                status: client_1.OrderStatus.CANCELLED,
            },
        }));
        paymentsRepository.transitionPaymentStatus.mockResolvedValue(makePaymentRecord({
            status: client_1.PaymentStatus.FAILED,
            failureCode: 'provider_declined',
            failureMessage: 'Card was declined.',
            failedAt: new Date('2026-04-24T08:12:00.000Z'),
        }));
        ordersRepository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.PLACED,
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
        });
        ordersRepository.updateOrderStatus.mockResolvedValue({});
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
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.CANCELLED,
            fromStatus: client_1.OrderStatus.PLACED,
            changedByUserId: 'usr_admin_1',
            reasonCode: 'provider_declined',
            note: 'Customer should retry with another card.',
        }, expect.anything());
        expect(menuInventoryLifecycleService.restoreTrackedInventoryForOrder).toHaveBeenCalledWith([
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
        ], expect.anything());
        expect(notificationEventService.publishMerchantInventoryCompensationAlert).toHaveBeenCalledWith(expect.objectContaining({
            resourceId: 'item_1',
            restoredQuantity: 2,
            orderCode: 'ORD-001',
            reasonCode: 'provider_declined',
        }));
        expect(systemMessageService.publishOrderEvent).toHaveBeenNthCalledWith(1, currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'PAYMENT_FAILED',
        }));
        expect(systemMessageService.publishOrderEvent).toHaveBeenNthCalledWith(2, currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'ORDER_CANCELLED',
        }));
        expect(result).toMatchObject({
            paymentId: 'payment_1',
            status: client_1.PaymentStatus.FAILED,
            order: {
                status: client_1.OrderStatus.CANCELLED,
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
        const service = new payment_lifecycle_service_1.PaymentLifecycleService(prisma, paymentsRepository, ordersRepository, systemMessageService, menuInventoryLifecycleService, notificationEventService);
        paymentsRepository.findById.mockResolvedValueOnce(makePaymentRecord({
            status: client_1.PaymentStatus.PENDING,
            method: client_1.PaymentMethod.MANUAL,
            provider: client_1.PaymentProvider.MANUAL,
            order: {
                ...makePaymentRecord().order,
                status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            },
        }));
        paymentsRepository.transitionPaymentStatus.mockResolvedValue(makePaymentRecord({
            status: client_1.PaymentStatus.CANCELLED,
            method: client_1.PaymentMethod.MANUAL,
            provider: client_1.PaymentProvider.MANUAL,
            cancelledAt: new Date('2026-04-24T08:15:00.000Z'),
            order: {
                ...makePaymentRecord().order,
                status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            },
        }));
        const result = await service.cancelCurrentPayment(currentUser, {
            paymentId: 'payment_1',
            note: 'Customer cancelled bank transfer.',
        });
        expect(ordersRepository.updateOrderStatus).not.toHaveBeenCalled();
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledTimes(1);
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            code: 'PAYMENT_CANCELLED',
        }));
        expect(result.status).toBe(client_1.PaymentStatus.CANCELLED);
    });
    it('returns the current payment when the same target transition is retried', async () => {
        const paymentsRepository = makePaymentsRepository();
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord({
            status: client_1.PaymentStatus.SUCCEEDED,
        }));
        const noOpService = new payment_lifecycle_service_1.PaymentLifecycleService(makePrismaService(), paymentsRepository, makeOrdersRepository(), makeSystemMessageService(), makeMenuInventoryLifecycleService(), makeNotificationEventService());
        const result = await noOpService.confirmCurrentPayment(currentUser, {
            paymentId: 'payment_1',
        });
        expect(paymentsRepository.transitionPaymentStatus).not.toHaveBeenCalled();
        expect(result.status).toBe(client_1.PaymentStatus.SUCCEEDED);
    });
    it('expires provider payments through trusted internal lifecycle calls', async () => {
        const prisma = makePrismaService();
        const paymentsRepository = makePaymentsRepository();
        const ordersRepository = makeOrdersRepository();
        const systemMessageService = makeSystemMessageService();
        const menuInventoryLifecycleService = makeMenuInventoryLifecycleService();
        const notificationEventService = makeNotificationEventService();
        const service = new payment_lifecycle_service_1.PaymentLifecycleService(prisma, paymentsRepository, ordersRepository, systemMessageService, menuInventoryLifecycleService, notificationEventService);
        const systemActor = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'system:payment-provider-webhook',
            sessionId: 'system:payment-provider-webhook',
            role: client_1.UserRole.SUPPORT,
            actorContext: {
                userId: 'system:payment-provider-webhook',
                phone: 'system',
                role: client_1.UserRole.SUPPORT,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        paymentsRepository.findById
            .mockResolvedValueOnce(makePaymentRecord({
            status: client_1.PaymentStatus.PROCESSING,
        }))
            .mockResolvedValueOnce(makePaymentRecord({
            status: client_1.PaymentStatus.EXPIRED,
            expiredAt: new Date('2026-04-24T08:20:00.000Z'),
            order: {
                ...makePaymentRecord().order,
                status: client_1.OrderStatus.CANCELLED,
            },
        }));
        paymentsRepository.transitionPaymentStatus.mockResolvedValue(makePaymentRecord({
            status: client_1.PaymentStatus.EXPIRED,
            expiredAt: new Date('2026-04-24T08:20:00.000Z'),
        }));
        ordersRepository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.PLACED,
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
        });
        ordersRepository.updateOrderStatus.mockResolvedValue({});
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
        const result = await service.expireCurrentPayment(systemActor, {
            paymentId: 'payment_1',
            reasonCode: 'provider_payment_expired',
            note: 'Provider reported payment expiration.',
        }, {
            skipAdminFinanceAccess: true,
        });
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.CANCELLED,
            fromStatus: client_1.OrderStatus.PLACED,
            changedByUserId: 'system:payment-provider-webhook',
            reasonCode: 'provider_payment_expired',
            note: 'Provider reported payment expiration.',
        }, expect.anything());
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(systemActor, expect.objectContaining({
            orderId: 'order_1',
            code: 'PAYMENT_CANCELLED',
        }));
        expect(menuInventoryLifecycleService.restoreTrackedInventoryForOrder).toHaveBeenCalledWith([
            {
                menuItemId: 'item_1',
                quantity: 1,
                menuItemStockTrackedSnapshot: true,
                selectedVariantCombinationId: undefined,
                variantCombinationStockTrackedSnapshot: undefined,
                inventoryLotAllocations: [],
                selectedOptions: [],
            },
        ], expect.anything());
        expect(notificationEventService.publishMerchantInventoryCompensationAlert).toHaveBeenCalledWith(expect.objectContaining({
            resourceId: 'item_1',
            restoredQuantity: 1,
            orderCode: 'ORD-001',
            reasonCode: 'provider_payment_expired',
        }));
        expect(result.status).toBe(client_1.PaymentStatus.EXPIRED);
    });
    it('rejects payment lifecycle operations for non-admin actors', async () => {
        const paymentsRepository = makePaymentsRepository();
        const service = new payment_lifecycle_service_1.PaymentLifecycleService(makePrismaService(), paymentsRepository, makeOrdersRepository(), makeSystemMessageService(), makeMenuInventoryLifecycleService(), makeNotificationEventService());
        await expect(service.confirmCurrentPayment((0, authenticated_user_factory_1.makeAuthenticatedUser)(), {
            paymentId: 'payment_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
        });
        expect(paymentsRepository.findById).not.toHaveBeenCalled();
    });
    it('rejects invalid confirmation transitions once a payment has already failed', async () => {
        const paymentsRepository = makePaymentsRepository();
        paymentsRepository.findById.mockResolvedValue(makePaymentRecord({
            status: client_1.PaymentStatus.FAILED,
            failureCode: 'provider_declined',
        }));
        const service = new payment_lifecycle_service_1.PaymentLifecycleService(makePrismaService(), paymentsRepository, makeOrdersRepository(), makeSystemMessageService(), makeMenuInventoryLifecycleService(), makeNotificationEventService());
        await expect(service.confirmCurrentPayment(currentUser, {
            paymentId: 'payment_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
});
//# sourceMappingURL=payment-lifecycle.service.spec.js.map