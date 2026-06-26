"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const customer_orders_controller_1 = require("../../../../src/modules/orders/controllers/customer-orders.controller");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
function makeCheckoutSubmission(overrides) {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        addressId: 'addr_1',
        cartId: 'cart_1',
        idempotencyKey: 'idem_1',
        status: client_1.OrderStatus.PLACED,
        currencyCode: 'MMK',
        subtotalAmount: '6500',
        discountAmount: '0',
        deliveryFee: '0',
        totalAmount: '6500',
        placedAt: '2026-04-19T10:00:00.000Z',
        isIdempotentReplay: false,
        paymentIntent: {
            paymentId: 'payment_1',
            orderId: 'order_1',
            customerProfileId: 'cust_prof_1',
            method: client_1.PaymentMethod.CASH_ON_DELIVERY,
            provider: client_1.PaymentProvider.COD,
            status: client_1.PaymentStatus.PENDING,
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
        },
        ...overrides,
    };
}
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
        availableActions: ['cancel'],
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
            deliveryInstructions: 'Call before arrival',
            latitude: '16.834',
            longitude: '96.176',
        },
        items: [],
        timeline: [],
        ...overrides,
    };
}
describe('CustomerOrdersController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        actorContext: {
            userId: 'usr_1',
            phone: '09123456789',
            role: client_1.UserRole.CUSTOMER,
            status: client_1.UserStatus.ACTIVE,
            customerProfileId: 'cust_prof_1',
        },
    });
    it('delegates list requests to the customer-scoped order query service', async () => {
        const orders = [makeOrderSummary(), makeOrderSummary({ orderId: 'order_2' })];
        const orderQueryService = {
            listCustomerOrders: jest.fn().mockResolvedValue(orders),
        };
        const controller = new customer_orders_controller_1.CustomerOrdersController({}, orderQueryService, {});
        const result = await controller.list(currentUser);
        expect(orderQueryService.listCustomerOrders).toHaveBeenCalledWith(currentUser);
        expect(result).toMatchObject([
            {
                orderId: 'order_1',
                availableActions: ['cancel'],
            },
            {
                orderId: 'order_2',
            },
        ]);
    });
    it('delegates detail requests to the customer-scoped order query service', async () => {
        const orderQueryService = {
            getCustomerOrderDetail: jest.fn().mockResolvedValue(makeOrderDetail()),
        };
        const controller = new customer_orders_controller_1.CustomerOrdersController({}, orderQueryService, {});
        const result = await controller.detail(currentUser, 'order_1');
        expect(orderQueryService.getCustomerOrderDetail).toHaveBeenCalledWith(currentUser, 'order_1');
        expect(result).toMatchObject({
            orderId: 'order_1',
            deliveryAddress: {
                addressId: 'addr_1',
            },
        });
    });
    it('delegates create requests to the order creation service and maps the submission DTO', async () => {
        const orderCreationService = {
            create: jest.fn().mockResolvedValue(makeCheckoutSubmission()),
        };
        const controller = new customer_orders_controller_1.CustomerOrdersController(orderCreationService, {}, {});
        const result = await controller.create(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
            idempotencyKey: 'idem_1',
        });
        expect(orderCreationService.create).toHaveBeenCalledWith(currentUser, {
            branchId: 'branch_1',
            addressId: 'addr_1',
            idempotencyKey: 'idem_1',
        });
        expect(result).toMatchObject({
            orderId: 'order_1',
            branchId: 'branch_1',
            idempotencyKey: 'idem_1',
            totalAmount: '6500',
            isIdempotentReplay: false,
            paymentIntent: {
                paymentId: 'payment_1',
                provider: client_1.PaymentProvider.COD,
            },
        });
    });
    it('delegates cancel requests to the order cancellation service and maps the updated order detail', async () => {
        const orderCancellationService = {
            cancelCurrentCustomerOrder: jest.fn().mockResolvedValue(makeOrderDetail({
                status: client_1.OrderStatus.CANCELLED,
                availableActions: [],
            })),
        };
        const controller = new customer_orders_controller_1.CustomerOrdersController({}, {}, orderCancellationService);
        const result = await controller.cancel(currentUser, 'order_1', {
            reasonCode: 'customer_changed_mind',
            note: 'Wrong address',
        });
        expect(orderCancellationService.cancelCurrentCustomerOrder).toHaveBeenCalledWith(currentUser, {
            orderId: 'order_1',
            reasonCode: 'customer_changed_mind',
            note: 'Wrong address',
        });
        expect(result).toMatchObject({
            orderId: 'order_1',
            status: client_1.OrderStatus.CANCELLED,
            availableActions: [],
        });
    });
});
//# sourceMappingURL=customer-orders.controller.spec.js.map