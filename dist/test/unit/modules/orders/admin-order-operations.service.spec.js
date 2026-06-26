"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
const admin_order_operations_service_1 = require("../../../../src/modules/orders/services/admin-order-operations.service");
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
        availableActions: ['admin_cancel', 'admin_override_status'],
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
describe('AdminOrderOperationsService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_admin_1',
        role: client_1.UserRole.ADMIN,
        actorContext: {
            userId: 'usr_admin_1',
            phone: '0990000000',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const makeService = () => {
        const prisma = {
            runInTransaction: jest.fn(async (callback) => callback({})),
        };
        const repository = {
            findOrderDetailById: jest.fn(),
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
        const service = new admin_order_operations_service_1.AdminOrderOperationsService(prisma, repository, new order_policy_service_1.OrderPolicyService(), queryService, systemMessageService, menuInventoryLifecycleService, notificationEventService);
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
        const { repository, queryService, menuInventoryLifecycleService, notificationEventService, service, } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
        });
        const cancelledOrder = makeOrderDetail({
            status: client_1.OrderStatus.CANCELLED,
            availableActions: ['admin_override_status'],
        });
        repository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
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
                restoredQuantity: 1,
                stockQuantity: 4,
                lowStockThreshold: 3,
            },
        ]);
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.cancelAdminOrder(currentUser, {
            orderId: 'order_1',
            reasonCode: 'admin_cancelled_duplicate_order',
            note: 'Customer placed a duplicate order.',
        });
        expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.CANCELLED,
            fromStatus: client_1.OrderStatus.MERCHANT_ACCEPTED,
            changedByUserId: 'usr_admin_1',
            reasonCode: 'admin_cancelled_duplicate_order',
            note: 'Customer placed a duplicate order.',
        }, expect.anything());
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
            orderCode: 'ORD-00000001',
            reasonCode: 'admin_cancelled_duplicate_order',
        }));
        expect(result.status).toBe(client_1.OrderStatus.CANCELLED);
    });
    it('returns the current order when the admin retries cancelling an already cancelled order', async () => {
        const { repository, queryService, service } = makeService();
        const cancelledOrder = makeOrderDetail({
            status: client_1.OrderStatus.CANCELLED,
            availableActions: ['admin_override_status'],
        });
        repository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.CANCELLED,
        });
        queryService.buildOrderDetail.mockReturnValue(cancelledOrder);
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.cancelAdminOrder(currentUser, {
            orderId: 'order_1',
        });
        expect(repository.updateOrderStatus).not.toHaveBeenCalled();
        expect(result.status).toBe(client_1.OrderStatus.CANCELLED);
    });
    it('rejects admin cancellation when the order is already terminal', async () => {
        const { repository, queryService, service } = makeService();
        const deliveredOrder = makeOrderDetail({
            status: client_1.OrderStatus.DELIVERED,
            availableActions: ['admin_override_status'],
        });
        repository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.DELIVERED,
        });
        queryService.buildOrderDetail.mockReturnValue(deliveredOrder);
        await expect(service.cancelAdminOrder(currentUser, {
            orderId: 'order_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('overrides an admin-visible order status when a reason code is provided', async () => {
        const { repository, queryService, service } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.PREPARING,
        });
        const overriddenOrder = makeOrderDetail({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            availableActions: ['admin_cancel', 'admin_override_status'],
        });
        repository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.PREPARING,
        });
        queryService.buildOrderDetail
            .mockReturnValueOnce(currentOrder)
            .mockReturnValueOnce(overriddenOrder);
        repository.updateOrderStatus.mockResolvedValue({});
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.overrideAdminOrderStatus(currentUser, {
            orderId: 'order_1',
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            reasonCode: 'admin_override_manual_assignment',
            note: 'Dispatcher is moving this order into rider assignment.',
        });
        expect(repository.updateOrderStatus).toHaveBeenCalledWith('order_1', {
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            fromStatus: client_1.OrderStatus.PREPARING,
            changedByUserId: 'usr_admin_1',
            reasonCode: 'admin_override_manual_assignment',
            note: 'Dispatcher is moving this order into rider assignment.',
        }, expect.anything());
        expect(result.status).toBe(client_1.OrderStatus.RIDER_ASSIGNED);
    });
    it('returns the current order when the admin retries the same override target status', async () => {
        const { repository, queryService, service } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        });
        repository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        });
        queryService.buildOrderDetail.mockReturnValue(currentOrder);
        queryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.overrideAdminOrderStatus(currentUser, {
            orderId: 'order_1',
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            reasonCode: 'admin_override_manual_assignment',
        });
        expect(repository.updateOrderStatus).not.toHaveBeenCalled();
        expect(result.status).toBe(client_1.OrderStatus.RIDER_ASSIGNED);
    });
    it('rejects admin status overrides when the reason code is missing or blank', async () => {
        const { service } = makeService();
        await expect(service.overrideAdminOrderStatus(currentUser, {
            orderId: 'order_1',
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            reasonCode: '   ',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        });
    });
});
//# sourceMappingURL=admin-order-operations.service.spec.js.map