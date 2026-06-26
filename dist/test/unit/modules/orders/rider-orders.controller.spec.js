"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_orders_controller_1 = require("../../../../src/modules/orders/controllers/rider-orders.controller");
function makeOrderSummary() {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        addressId: 'addr_1',
        cartId: 'cart_1',
        status: client_1.OrderStatus.RIDER_ASSIGNED,
        currencyCode: 'MMK',
        subtotalAmount: '6500',
        discountAmount: '0',
        deliveryFee: '500',
        totalAmount: '7000',
        placedAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:05:00.000Z',
        availableActions: [],
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
        delivery: {
            deliveryId: 'delivery_1',
            riderId: 'rider_1',
            etaMinutes: 15,
            rider: {
                riderId: 'rider_1',
                userId: 'usr_rider_1',
                phone: '0999999999',
                userStatus: client_1.UserStatus.ACTIVE,
                displayName: 'Ko Aung',
                vehicleType: 'bike',
                currentTownship: 'Pabedan',
                status: 'ACTIVE',
            },
        },
    };
}
function makeOrderDetail() {
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
    };
}
describe('RiderOrdersController', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
        userId: 'usr_rider_1',
        role: client_1.UserRole.RIDER,
        actorContext: {
            userId: 'usr_rider_1',
            phone: '0999999999',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
            riderId: 'rider_1',
        },
    });
    it('delegates list requests to the rider-scoped order query service', async () => {
        const orderQueryService = {
            listRiderOrders: jest.fn().mockResolvedValue([makeOrderSummary()]),
        };
        const controller = new rider_orders_controller_1.RiderOrdersController(orderQueryService);
        const result = await controller.list(currentUser);
        expect(orderQueryService.listRiderOrders).toHaveBeenCalledWith(currentUser);
        expect(result[0]).toMatchObject({
            orderId: 'order_1',
        });
    });
    it('delegates detail requests to the rider-scoped order query service', async () => {
        const orderQueryService = {
            getRiderOrderDetail: jest.fn().mockResolvedValue(makeOrderDetail()),
        };
        const controller = new rider_orders_controller_1.RiderOrdersController(orderQueryService);
        const result = await controller.detail(currentUser, 'order_1');
        expect(orderQueryService.getRiderOrderDetail).toHaveBeenCalledWith(currentUser, 'order_1');
        expect(result).toMatchObject({
            orderId: 'order_1',
            delivery: {
                riderId: 'rider_1',
            },
        });
    });
});
//# sourceMappingURL=rider-orders.controller.spec.js.map