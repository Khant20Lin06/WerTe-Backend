"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
const dispatch_assignment_service_1 = require("../../../../src/modules/dispatch/services/dispatch-assignment.service");
function makeOrderDetail(overrides) {
    return {
        orderId: 'order_1',
        orderCode: 'ORD-00000001',
        customerProfileId: 'cust_prof_1',
        branchId: 'branch_1',
        addressId: 'addr_1',
        cartId: 'cart_1',
        status: client_1.OrderStatus.PREPARING,
        currencyCode: 'MMK',
        subtotalAmount: '6500',
        discountAmount: '0',
        deliveryFee: '500',
        totalAmount: '7000',
        placedAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:05:00.000Z',
        availableActions: ['admin_assign_rider', 'admin_cancel', 'admin_override_status'],
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
function makeRider(overrides) {
    return {
        id: 'rider_1',
        userId: 'usr_rider_1',
        displayName: 'Ko Aung',
        vehicleType: 'bike',
        currentTownship: 'Pabedan',
        status: client_1.RiderStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_rider_1',
            phone: '0999999999',
            role: client_1.UserRole.RIDER,
            status: client_1.UserStatus.ACTIVE,
        },
        availability: {
            isOnline: true,
            isAvailable: true,
            lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
            updatedAt: new Date('2026-04-19T00:05:00.000Z'),
        },
        ...overrides,
    };
}
describe('DispatchAssignmentService', () => {
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
            runInTransaction: jest
                .fn()
                .mockImplementation(async (operation) => operation({})),
        };
        const ordersRepository = {
            findOrderDetailById: jest.fn(),
            updateOrderStatus: jest.fn(),
        };
        const orderQueryService = {
            buildOrderDetail: jest.fn(),
            attachAvailableActions: jest.fn(),
        };
        const deliveriesRepository = {
            upsertAssignedDelivery: jest.fn(),
        };
        const ridersService = {
            findById: jest.fn(),
        };
        const systemMessageService = {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        };
        const service = new dispatch_assignment_service_1.DispatchAssignmentService(prisma, ordersRepository, orderQueryService, new order_policy_service_1.OrderPolicyService(), deliveriesRepository, ridersService, systemMessageService);
        return {
            prisma,
            ordersRepository,
            orderQueryService,
            deliveriesRepository,
            ridersService,
            systemMessageService,
            service,
        };
    };
    it('assigns a rider to a preparing order and transitions the order to rider_assigned', async () => {
        const { prisma, ordersRepository, orderQueryService, deliveriesRepository, ridersService, systemMessageService, service, } = makeService();
        const currentOrder = makeOrderDetail({
            status: client_1.OrderStatus.PREPARING,
        });
        const assignedOrder = makeOrderDetail({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            availableActions: ['admin_cancel', 'admin_override_status'],
            delivery: {
                deliveryId: 'delivery_1',
                riderId: 'rider_1',
                etaMinutes: 18,
                rider: {
                    riderId: 'rider_1',
                    userId: 'usr_rider_1',
                    phone: '0999999999',
                    userStatus: client_1.UserStatus.ACTIVE,
                    displayName: 'Ko Aung',
                    vehicleType: 'bike',
                    currentTownship: 'Pabedan',
                    status: client_1.RiderStatus.ACTIVE,
                },
            },
        });
        ordersRepository.findOrderDetailById
            .mockResolvedValueOnce({
            status: client_1.OrderStatus.PREPARING,
        })
            .mockResolvedValueOnce({});
        orderQueryService.buildOrderDetail
            .mockReturnValueOnce(currentOrder)
            .mockReturnValueOnce(assignedOrder);
        orderQueryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        ridersService.findById.mockResolvedValue(makeRider());
        deliveriesRepository.upsertAssignedDelivery.mockResolvedValue({});
        ordersRepository.updateOrderStatus.mockResolvedValue({});
        const result = await service.assignRiderToOrder(currentUser, {
            orderId: 'order_1',
            riderId: 'rider_1',
            etaMinutes: 18,
        });
        expect(prisma.runInTransaction).toHaveBeenCalled();
        expect(deliveriesRepository.upsertAssignedDelivery).toHaveBeenCalledWith('order_1', expect.objectContaining({
            riderId: 'rider_1',
            etaMinutes: 18,
        }), {});
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', expect.objectContaining({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            fromStatus: client_1.OrderStatus.PREPARING,
            changedByUserId: 'usr_admin_1',
            reasonCode: 'admin_assigned_rider',
        }), {});
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'RIDER_ASSIGNED',
        }));
        expect(result.status).toBe(client_1.OrderStatus.RIDER_ASSIGNED);
    });
    it('returns the current order when the same rider is already assigned', async () => {
        const { ordersRepository, orderQueryService, service } = makeService();
        const assignedOrder = makeOrderDetail({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
            delivery: {
                deliveryId: 'delivery_1',
                riderId: 'rider_1',
                etaMinutes: 18,
                rider: {
                    riderId: 'rider_1',
                    userId: 'usr_rider_1',
                    phone: '0999999999',
                    userStatus: client_1.UserStatus.ACTIVE,
                    displayName: 'Ko Aung',
                    vehicleType: 'bike',
                    currentTownship: 'Pabedan',
                    status: client_1.RiderStatus.ACTIVE,
                },
            },
        });
        ordersRepository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        });
        orderQueryService.buildOrderDetail.mockReturnValue(assignedOrder);
        orderQueryService.attachAvailableActions.mockImplementation((_currentUser, order) => order);
        const result = await service.assignRiderToOrder(currentUser, {
            orderId: 'order_1',
            riderId: 'rider_1',
        });
        expect(result.status).toBe(client_1.OrderStatus.RIDER_ASSIGNED);
    });
    it('rejects assignment when the order is not in preparing state', async () => {
        const { ordersRepository, orderQueryService, service } = makeService();
        ordersRepository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.DELIVERED,
        });
        orderQueryService.buildOrderDetail.mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.DELIVERED,
            availableActions: ['admin_override_status'],
        }));
        await expect(service.assignRiderToOrder(currentUser, {
            orderId: 'order_1',
            riderId: 'rider_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('rejects assignment when the order cannot be found', async () => {
        const { ordersRepository, service } = makeService();
        ordersRepository.findOrderDetailById.mockResolvedValue(null);
        await expect(service.assignRiderToOrder(currentUser, {
            orderId: 'order_missing',
            riderId: 'rider_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
        });
    });
    it('rejects assignment when the rider is not available for dispatch', async () => {
        const { ordersRepository, orderQueryService, ridersService, service, } = makeService();
        ordersRepository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.PREPARING,
        });
        orderQueryService.buildOrderDetail.mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.PREPARING,
        }));
        ridersService.findById.mockResolvedValue(makeRider({
            availability: {
                isOnline: false,
                isAvailable: false,
                lastStatusChangedAt: new Date('2026-04-19T00:05:00.000Z'),
                updatedAt: new Date('2026-04-19T00:05:00.000Z'),
            },
        }));
        await expect(service.assignRiderToOrder(currentUser, {
            orderId: 'order_1',
            riderId: 'rider_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('rejects assignment when the rider cannot be found', async () => {
        const { ordersRepository, orderQueryService, ridersService, service, } = makeService();
        ordersRepository.findOrderDetailById.mockResolvedValue({
            status: client_1.OrderStatus.PREPARING,
        });
        orderQueryService.buildOrderDetail.mockReturnValue(makeOrderDetail({
            status: client_1.OrderStatus.PREPARING,
        }));
        ridersService.findById.mockResolvedValue(null);
        await expect(service.assignRiderToOrder(currentUser, {
            orderId: 'order_1',
            riderId: 'rider_missing',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
        });
    });
});
//# sourceMappingURL=dispatch-assignment.service.spec.js.map