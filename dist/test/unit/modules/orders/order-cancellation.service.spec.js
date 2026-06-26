"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
const order_cancellation_service_1 = require("../../../../src/modules/orders/services/order-cancellation.service");
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
        availableActions: ['cancel'],
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
describe('OrderCancellationService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_customer_1',
        role: client_1.UserRole.CUSTOMER,
        actorContext: {
            userId: 'usr_customer_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    const makeService = () => {
        const prisma = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };
        const repository = {
            findCustomerOrderDetail: jest.fn(),
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
        const service = new order_cancellation_service_1.OrderCancellationService(prisma, repository, new order_policy_service_1.OrderPolicyService(), queryService, systemMessageService, menuInventoryLifecycleService, notificationEventService);
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
        const { repository, queryService, menuInventoryLifecycleService, notificationEventService, service, } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.PLACED,
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
                            optionGroupKindSnapshot: client_1.ItemOptionGroupKind.ADD_ON,
                            nameSnapshot: 'Extra fish cake',
                            priceDeltaSnapshot: '750',
                        },
                    ],
                },
            ],
        });
        const cancelledOrder = makeOrderDetail({
            status: client_1.OrderStatus.CANCELLED,
            availableActions: [],
        });
        repository.findCustomerOrderDetail.mockResolvedValue({
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
        queryService.buildOrderDetail
            .mockReturnValueOnce(currentOrder)
            .mockReturnValueOnce(cancelledOrder);
        repository.updateOrderStatus.mockResolvedValue({});
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
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.cancelCurrentCustomerOrder(currentUser, {
            orderId: 'order_1',
            reasonCode: 'customer_changed_mind',
            note: 'Wrong address',
        });
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
        expect(repository.findCustomerOrderDetail).toHaveBeenCalledWith('order_1', 'cust_prof_1');
        expect(menuInventoryLifecycleService.collectTrackedInventoryRestorationAlerts).toHaveBeenCalledWith([
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
        ], expect.anything());
        expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.CANCELLED,
            fromStatus: client_1.OrderStatus.PLACED,
            changedByUserId: 'usr_customer_1',
            reasonCode: 'customer_changed_mind',
            note: 'Wrong address',
        }, expect.anything());
        expect(notificationEventService.publishMerchantInventoryCompensationAlert).toHaveBeenCalledWith(expect.objectContaining({
            resourceId: 'item_1',
            restoredQuantity: 2,
            orderCode: 'ORD-00000001',
            reasonCode: 'customer_changed_mind',
        }));
        expect(result.status).toBe(client_1.OrderStatus.CANCELLED);
    });
    it('returns the current order when the customer retries cancelling an already cancelled order', async () => {
        const { repository, queryService, service } = makeService();
        const cancelledOrder = makeOrderDetail({
            status: client_1.OrderStatus.CANCELLED,
            availableActions: [],
        });
        repository.findCustomerOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.CANCELLED,
        });
        queryService.buildOrderDetail.mockReturnValue(cancelledOrder);
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.cancelCurrentCustomerOrder(currentUser, {
            orderId: 'order_1',
        });
        expect(repository.updateOrderStatus).not.toHaveBeenCalled();
        expect(result.status).toBe(client_1.OrderStatus.CANCELLED);
    });
    it('rejects cancellation when the order is no longer customer-cancellable', async () => {
        const { repository, queryService, service } = makeService();
        const deliveredOrder = makeOrderDetail({
            status: client_1.OrderStatus.DELIVERED,
            availableActions: [],
        });
        repository.findCustomerOrderDetail.mockResolvedValue({
            status: client_1.OrderStatus.DELIVERED,
        });
        queryService.buildOrderDetail.mockReturnValue(deliveredOrder);
        await expect(service.cancelCurrentCustomerOrder(currentUser, {
            orderId: 'order_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('rejects cancellation when the scoped customer order cannot be found', async () => {
        const { repository, service } = makeService();
        repository.findCustomerOrderDetail.mockResolvedValue(null);
        await expect(service.cancelCurrentCustomerOrder(currentUser, {
            orderId: 'order_missing',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
        });
    });
});
//# sourceMappingURL=order-cancellation.service.spec.js.map