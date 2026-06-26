"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
const merchant_order_handling_service_1 = require("../../../../src/modules/orders/services/merchant-order-handling.service");
function makeOrderDetail(overrides) {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        addressId: 'addr_1',
        cartId: 'cart_1',
        status: client_1.OrderStatus.PLACED,
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
            userStatus: client_1.UserStatus.ACTIVE,
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
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_merchant_1',
        role: client_1.UserRole.MERCHANT,
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0942000000',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    });
    const makeService = () => {
        const prisma = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };
        const repository = {
            findMerchantOrderDetail: jest.fn(),
            updateOrderStatus: jest.fn(),
        };
        const queryService = {
            buildOrderDetail: jest.fn(),
            attachAvailableActions: jest.fn(),
        };
        const systemMessageService = {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        };
        const menuInventoryLifecycleService = {
            restoreTrackedInventoryForOrder: jest.fn().mockResolvedValue(undefined),
            collectTrackedInventoryRestorationAlerts: jest.fn().mockResolvedValue([]),
        };
        const notificationEventService = {
            publishMerchantInventoryCompensationAlert: jest
                .fn()
                .mockResolvedValue(undefined),
        };
        const queueService = { add: jest.fn().mockResolvedValue(undefined) };
        const service = new merchant_order_handling_service_1.MerchantOrderHandlingService(prisma, repository, new order_policy_service_1.OrderPolicyService(), queryService, systemMessageService, menuInventoryLifecycleService, notificationEventService, queueService);
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
            status: client_1.OrderStatus.PLACED,
        });
        const acceptedOrder = makeOrderDetail({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            availableActions: ['mark_preparing'],
        });
        repository.findMerchantOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.PLACED,
        });
        queryService.buildOrderDetail
            .mockReturnValueOnce(currentOrder)
            .mockReturnValueOnce(acceptedOrder);
        repository.updateOrderStatus.mockResolvedValue({});
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.acceptCurrentMerchantOrder(currentUser, {
            orderId: 'order_1',
        });
        expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            fromStatus: client_1.OrderStatus.PLACED,
            changedByUserId: 'usr_merchant_1',
            reasonCode: 'merchant_accepted',
            note: null,
        }, expect.anything());
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'ORDER_ACCEPTED',
        }));
        expect(result.status).toBe(client_1.OrderStatus.MERCHANT_ACCEPTED);
    });
    it('rejects an eligible placed order with merchant-supplied reason metadata', async () => {
        const { repository, queryService, menuInventoryLifecycleService, notificationEventService, service, } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.PLACED,
        });
        const rejectedOrder = makeOrderDetail({
            status: client_1.OrderStatus.MERCHANT_REJECTED,
            availableActions: [],
        });
        repository.findMerchantOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.PLACED,
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
        });
        queryService.buildOrderDetail
            .mockReturnValueOnce(currentOrder)
            .mockReturnValueOnce(rejectedOrder);
        repository.updateOrderStatus.mockResolvedValue({});
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
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.rejectCurrentMerchantOrder(currentUser, {
            orderId: 'order_1',
            reasonCode: 'merchant_rejected_out_of_stock',
            note: 'Out of stock',
        });
        expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.MERCHANT_REJECTED,
            fromStatus: client_1.OrderStatus.PLACED,
            changedByUserId: 'usr_merchant_1',
            reasonCode: 'merchant_rejected_out_of_stock',
            note: 'Out of stock',
        }, expect.anything());
        expect(menuInventoryLifecycleService.restoreTrackedInventoryForOrder).toHaveBeenCalledWith([
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
        ], expect.anything());
        expect(notificationEventService.publishMerchantInventoryCompensationAlert).toHaveBeenCalledWith(expect.objectContaining({
            resourceId: 'item_1',
            restoredQuantity: 1,
            orderCode: 'ORD-00000001',
            reasonCode: 'merchant_rejected_out_of_stock',
        }));
        expect(result.status).toBe(client_1.OrderStatus.MERCHANT_REJECTED);
    });
    it('marks an accepted order as preparing when the transition is allowed', async () => {
        const { repository, queryService, service } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            availableActions: ['mark_preparing'],
        });
        const preparingOrder = makeOrderDetail({
            status: client_1.OrderStatus.PREPARING,
            availableActions: [],
        });
        repository.findMerchantOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
        });
        queryService.buildOrderDetail
            .mockReturnValueOnce(currentOrder)
            .mockReturnValueOnce(preparingOrder);
        repository.updateOrderStatus.mockResolvedValue({});
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.markPreparingCurrentMerchantOrder(currentUser, {
            orderId: 'order_1',
        });
        expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.PREPARING,
            fromStatus: client_1.OrderStatus.MERCHANT_ACCEPTED,
            changedByUserId: 'usr_merchant_1',
            reasonCode: 'merchant_preparing',
            note: null,
        }, expect.anything());
        expect(result.status).toBe(client_1.OrderStatus.PREPARING);
    });
    it('returns the current order when the merchant retries the same target action', async () => {
        const { repository, queryService, service } = makeService();
        const acceptedOrder = makeOrderDetail({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            availableActions: ['mark_preparing'],
        });
        repository.findMerchantOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
        });
        queryService.buildOrderDetail.mockReturnValue(acceptedOrder);
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.acceptCurrentMerchantOrder(currentUser, {
            orderId: 'order_1',
        });
        expect(repository.updateOrderStatus).not.toHaveBeenCalled();
        expect(result.status).toBe(client_1.OrderStatus.MERCHANT_ACCEPTED);
    });
    it('rejects merchant actions when the transition is not allowed anymore', async () => {
        const { repository, queryService, service } = makeService();
        const deliveredOrder = makeOrderDetail({
            status: client_1.OrderStatus.DELIVERED,
            availableActions: [],
        });
        repository.findMerchantOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.DELIVERED,
        });
        queryService.buildOrderDetail.mockReturnValue(deliveredOrder);
        await expect(service.acceptCurrentMerchantOrder(currentUser, {
            orderId: 'order_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('rejects merchant actions when the scoped order cannot be found', async () => {
        const { repository, service } = makeService();
        repository.findMerchantOrderDetail.mockResolvedValue(null);
        await expect(service.acceptCurrentMerchantOrder(currentUser, {
            orderId: 'order_missing',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
        });
    });
});
//# sourceMappingURL=merchant-order-handling.service.spec.js.map