"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const merchant_orders_controller_1 = require("../../../../src/modules/orders/controllers/merchant-orders.controller");
function makeOrderSummary(overrides) {
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
            userId: 'usr_1',
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
        ...overrides,
    };
}
function makeOrderDetail(overrides) {
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
describe('MerchantOrdersController', () => {
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
    it('delegates list requests to the merchant-scoped order query service', async () => {
        const orderQueryService = {
            listMerchantOrders: jest.fn().mockResolvedValue([makeOrderSummary()]),
        };
        const controller = new merchant_orders_controller_1.MerchantOrdersController(orderQueryService, {});
        const result = await controller.list(currentUser, undefined);
        expect(orderQueryService.listMerchantOrders).toHaveBeenCalledWith(currentUser, { branchId: undefined });
        expect(result[0]).toMatchObject({
            orderId: 'order_1',
            availableActions: ['merchant_accept', 'merchant_reject'],
        });
    });
    it('delegates detail requests to the merchant-scoped order query service', async () => {
        const orderQueryService = {
            getMerchantOrderDetail: jest.fn().mockResolvedValue(makeOrderDetail()),
        };
        const controller = new merchant_orders_controller_1.MerchantOrdersController(orderQueryService, {});
        const result = await controller.detail(currentUser, 'order_1');
        expect(orderQueryService.getMerchantOrderDetail).toHaveBeenCalledWith(currentUser, 'order_1');
        expect(result).toMatchObject({
            orderId: 'order_1',
            deliveryAddress: {
                addressId: 'addr_1',
            },
        });
    });
    it('delegates accept requests to the merchant order handling service', async () => {
        const merchantOrderHandlingService = {
            acceptCurrentMerchantOrder: jest.fn().mockResolvedValue(makeOrderDetail({
                status: client_1.OrderStatus.MERCHANT_ACCEPTED,
                availableActions: ['mark_preparing'],
            })),
        };
        const controller = new merchant_orders_controller_1.MerchantOrdersController({}, merchantOrderHandlingService);
        const result = await controller.accept(currentUser, 'order_1', {
            reasonCode: 'merchant_accepted',
        });
        expect(merchantOrderHandlingService.acceptCurrentMerchantOrder).toHaveBeenCalledWith(currentUser, {
            orderId: 'order_1',
            reasonCode: 'merchant_accepted',
            note: undefined,
        });
        expect(result).toMatchObject({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
        });
    });
    it('delegates reject requests to the merchant order handling service', async () => {
        const merchantOrderHandlingService = {
            rejectCurrentMerchantOrder: jest.fn().mockResolvedValue(makeOrderDetail({
                status: client_1.OrderStatus.MERCHANT_REJECTED,
                availableActions: [],
            })),
        };
        const controller = new merchant_orders_controller_1.MerchantOrdersController({}, merchantOrderHandlingService);
        const result = await controller.reject(currentUser, 'order_1', {
            reasonCode: 'merchant_rejected_out_of_stock',
            note: 'Out of stock',
        });
        expect(merchantOrderHandlingService.rejectCurrentMerchantOrder).toHaveBeenCalledWith(currentUser, {
            orderId: 'order_1',
            reasonCode: 'merchant_rejected_out_of_stock',
            note: 'Out of stock',
        });
        expect(result).toMatchObject({
            status: client_1.OrderStatus.MERCHANT_REJECTED,
        });
    });
    it('delegates preparing requests to the merchant order handling service', async () => {
        const merchantOrderHandlingService = {
            markPreparingCurrentMerchantOrder: jest.fn().mockResolvedValue(makeOrderDetail({
                status: client_1.OrderStatus.PREPARING,
                availableActions: [],
            })),
        };
        const controller = new merchant_orders_controller_1.MerchantOrdersController({}, merchantOrderHandlingService);
        const result = await controller.markPreparing(currentUser, 'order_1', {});
        expect(merchantOrderHandlingService.markPreparingCurrentMerchantOrder).toHaveBeenCalledWith(currentUser, {
            orderId: 'order_1',
            reasonCode: undefined,
            note: undefined,
        });
        expect(result).toMatchObject({
            status: client_1.OrderStatus.PREPARING,
        });
    });
});
//# sourceMappingURL=merchant-orders.controller.spec.js.map