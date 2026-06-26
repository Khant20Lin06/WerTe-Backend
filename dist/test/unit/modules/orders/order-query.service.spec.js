"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
const order_query_service_1 = require("../../../../src/modules/orders/services/order-query.service");
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
        availableActions: [],
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
describe('OrderQueryService', () => {
    const makeService = () => {
        const repository = {
            findCustomerOrderSummaries: jest.fn(),
            findCustomerOrderDetail: jest.fn(),
            findMerchantOrderSummaries: jest.fn(),
            findMerchantOrderDetail: jest.fn(),
            findRiderOrderSummaries: jest.fn(),
            findRiderOrderDetail: jest.fn(),
            findRecentOrderSummaries: jest.fn(),
            findOrderDetailById: jest.fn(),
        };
        const policy = new order_policy_service_1.OrderPolicyService();
        const service = new order_query_service_1.OrderQueryService(repository, policy);
        return { repository, service };
    };
    it('lists customer orders by customer scope and attaches customer actions', async () => {
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
        const { repository, service } = makeService();
        jest
            .spyOn(service, 'buildOrderSummary')
            .mockReturnValue(makeOrderSummary());
        repository.findCustomerOrderSummaries.mockResolvedValue([{}]);
        const result = await service.listCustomerOrders(currentUser);
        expect(repository.findCustomerOrderSummaries).toHaveBeenCalledWith('cust_prof_1');
        expect(result[0].availableActions).toEqual(['cancel']);
    });
    it('lists merchant orders by merchant scope and attaches merchant actions', async () => {
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
        const { repository, service } = makeService();
        jest
            .spyOn(service, 'buildOrderSummary')
            .mockReturnValue(makeOrderSummary());
        repository.findMerchantOrderSummaries.mockResolvedValue([{}]);
        const result = await service.listMerchantOrders(currentUser);
        expect(repository.findMerchantOrderSummaries).toHaveBeenCalledWith('merchant_1', { branchId: undefined });
        expect(result[0].availableActions).toEqual([
            'merchant_accept',
            'merchant_reject',
        ]);
    });
    it('returns admin order detail with admin override action attached', async () => {
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
        const { repository, service } = makeService();
        jest
            .spyOn(service, 'buildOrderDetail')
            .mockReturnValue(makeOrderDetail());
        repository.findOrderDetailById.mockResolvedValue({});
        const result = await service.getAdminOrderDetail(currentUser, 'order_1');
        expect(repository.findOrderDetailById).toHaveBeenCalledWith('order_1');
        expect(result.availableActions).toEqual([
            'admin_cancel',
            'admin_override_status',
        ]);
    });
    it('returns only mark_preparing for merchant order details that are already accepted', async () => {
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
        const { repository, service } = makeService();
        jest.spyOn(service, 'buildOrderDetail').mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
        }));
        repository.findMerchantOrderDetail.mockResolvedValue({});
        const result = await service.getMerchantOrderDetail(currentUser, 'order_1');
        expect(result.availableActions).toEqual(['mark_preparing']);
    });
    it('returns only admin override action for delivered admin orders', async () => {
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
        const { repository, service } = makeService();
        jest.spyOn(service, 'buildOrderDetail').mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.DELIVERED,
        }));
        repository.findOrderDetailById.mockResolvedValue({});
        const result = await service.getAdminOrderDetail(currentUser, 'order_1');
        expect(result.availableActions).toEqual(['admin_override_status']);
    });
    it('returns rider assignment actions for rider order details that are awaiting acceptance', async () => {
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
        const { repository, service } = makeService();
        jest.spyOn(service, 'buildOrderDetail').mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
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
        }));
        repository.findRiderOrderDetail.mockResolvedValue({});
        const result = await service.getRiderOrderDetail(currentUser, 'order_1');
        expect(result.availableActions).toEqual([
            'rider_accept_assignment',
            'rider_reject_assignment',
        ]);
    });
    it('returns admin assign rider for preparing admin order details', async () => {
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
        const { repository, service } = makeService();
        jest.spyOn(service, 'buildOrderDetail').mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.PREPARING,
        }));
        repository.findOrderDetailById.mockResolvedValue({});
        const result = await service.getAdminOrderDetail(currentUser, 'order_1');
        expect(result.availableActions).toEqual([
            'admin_assign_rider',
            'admin_cancel',
            'admin_override_status',
        ]);
    });
    it('throws not found when a scoped order detail cannot be resolved', async () => {
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
        const { repository, service } = makeService();
        repository.findCustomerOrderDetail.mockResolvedValue(null);
        await expect(service.getCustomerOrderDetail(currentUser, 'order_missing')).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
        });
    });
    it('throws forbidden when the actor is missing the required merchant scope', async () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0942000000',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        const { service } = makeService();
        await expect(service.listMerchantOrders(currentUser)).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
        });
    });
});
//# sourceMappingURL=order-query.service.spec.js.map