"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_delivery_actions_service_1 = require("../../../../src/modules/deliveries/services/rider-delivery-actions.service");
function makeDeliveryRecord(overrides) {
    return {
        id: 'delivery_1',
        orderId: 'order_1',
        riderId: 'rider_1',
        status: client_1.DeliveryStatus.ASSIGNED,
        etaMinutes: 18,
        assignedAt: new Date('2026-04-19T10:10:00.000Z'),
        acceptedAt: null,
        pickedUpAt: null,
        onTheWayAt: null,
        deliveredAt: null,
        failedAt: null,
        cancelledAt: null,
        failureReasonCode: null,
        failureNote: null,
        createdAt: new Date('2026-04-19T10:10:00.000Z'),
        updatedAt: new Date('2026-04-19T10:10:00.000Z'),
        order: {
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        },
        rider: null,
        ...overrides,
    };
}
function makeDeliveryDetail(overrides) {
    return {
        deliveryId: 'delivery_1',
        orderId: 'order_1',
        riderId: 'rider_1',
        status: client_1.DeliveryStatus.ASSIGNED,
        order: {
            orderId: 'order_1',
            orderStatus: client_1.OrderStatus.RIDER_ASSIGNED,
        },
        ...overrides,
    };
}
describe('RiderDeliveryActionsService', () => {
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
    const makeService = () => {
        const prisma = {
            runInTransaction: jest
                .fn()
                .mockImplementation(async (operation) => operation({})),
        };
        const deliveriesRepository = {
            findRiderDeliveryById: jest.fn(),
            findById: jest.fn(),
            updateById: jest.fn(),
        };
        const ordersRepository = {
            updateOrderStatus: jest.fn(),
        };
        const deliveryQueryService = {
            buildDeliveryDetail: jest.fn(),
        };
        const systemMessageService = {
            publishOrderEvent: jest.fn().mockResolvedValue(undefined),
        };
        const service = new rider_delivery_actions_service_1.RiderDeliveryActionsService(prisma, deliveriesRepository, ordersRepository, deliveryQueryService, systemMessageService);
        return {
            prisma,
            deliveriesRepository,
            ordersRepository,
            deliveryQueryService,
            systemMessageService,
            service,
        };
    };
    it('accepts an assigned delivery request and transitions the order to rider_accepted', async () => {
        const { prisma, deliveriesRepository, ordersRepository, deliveryQueryService, systemMessageService, service, } = makeService();
        deliveriesRepository.findRiderDeliveryById
            .mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.ASSIGNED,
            order: {
                status: client_1.OrderStatus.RIDER_ASSIGNED,
            },
        }))
            .mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.ACCEPTED,
            order: {
                status: client_1.OrderStatus.RIDER_ACCEPTED,
            },
            acceptedAt: new Date('2026-04-19T10:12:00.000Z'),
        }));
        deliveriesRepository.updateById.mockResolvedValue({});
        ordersRepository.updateOrderStatus.mockResolvedValue({});
        deliveryQueryService.buildDeliveryDetail.mockReturnValue(makeDeliveryDetail({
            status: client_1.DeliveryStatus.ACCEPTED,
            order: {
                orderId: 'order_1',
                orderStatus: client_1.OrderStatus.RIDER_ACCEPTED,
            },
        }));
        const result = await service.acceptCurrentRiderDeliveryRequest(currentUser, {
            deliveryId: 'delivery_1',
        });
        expect(prisma.runInTransaction).toHaveBeenCalled();
        expect(deliveriesRepository.updateById).toHaveBeenCalledWith('delivery_1', expect.objectContaining({
            status: client_1.DeliveryStatus.ACCEPTED,
        }), {});
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', expect.objectContaining({
            status: client_1.OrderStatus.RIDER_ACCEPTED,
            fromStatus: client_1.OrderStatus.RIDER_ASSIGNED,
            changedByUserId: 'usr_rider_1',
            reasonCode: 'rider_accepted_assignment',
        }), {});
        expect(systemMessageService.publishOrderEvent).toHaveBeenCalledWith(currentUser, expect.objectContaining({
            orderId: 'order_1',
            code: 'RIDER_ACCEPTED',
        }));
        expect(result).toMatchObject({
            status: client_1.DeliveryStatus.ACCEPTED,
        });
    });
    it('rejects an assigned delivery request and requeues the order for dispatch', async () => {
        const { deliveriesRepository, ordersRepository, deliveryQueryService, service, } = makeService();
        deliveriesRepository.findRiderDeliveryById.mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.ASSIGNED,
            order: {
                status: client_1.OrderStatus.RIDER_ASSIGNED,
            },
        }));
        deliveriesRepository.updateById.mockResolvedValue({});
        ordersRepository.updateOrderStatus.mockResolvedValue({});
        deliveriesRepository.findById.mockResolvedValue(makeDeliveryRecord({
            riderId: null,
            status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
            etaMinutes: null,
            order: {
                status: client_1.OrderStatus.PREPARING,
            },
        }));
        deliveryQueryService.buildDeliveryDetail.mockReturnValue(makeDeliveryDetail({
            riderId: null,
            status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
            order: {
                orderId: 'order_1',
                orderStatus: client_1.OrderStatus.PREPARING,
            },
        }));
        const result = await service.rejectCurrentRiderDeliveryRequest(currentUser, {
            deliveryId: 'delivery_1',
            reasonCode: 'rider_rejected_assignment',
            note: 'Too far away.',
        });
        expect(deliveriesRepository.updateById).toHaveBeenCalledWith('delivery_1', expect.objectContaining({
            riderId: null,
            status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
            etaMinutes: null,
        }), {});
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', expect.objectContaining({
            status: client_1.OrderStatus.PREPARING,
            reasonCode: 'rider_rejected_assignment',
            note: 'Too far away.',
        }), {});
        expect(result).toMatchObject({
            status: client_1.DeliveryStatus.PENDING_ASSIGNMENT,
            riderId: null,
        });
    });
    it('marks a picked up delivery as on the way', async () => {
        const { deliveriesRepository, ordersRepository, deliveryQueryService, service, } = makeService();
        deliveriesRepository.findRiderDeliveryById
            .mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.PICKED_UP,
            order: {
                status: client_1.OrderStatus.PICKED_UP,
            },
        }))
            .mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.ON_THE_WAY,
            order: {
                status: client_1.OrderStatus.ON_THE_WAY,
            },
        }));
        deliveriesRepository.updateById.mockResolvedValue({});
        ordersRepository.updateOrderStatus.mockResolvedValue({});
        deliveryQueryService.buildDeliveryDetail.mockReturnValue(makeDeliveryDetail({
            status: client_1.DeliveryStatus.ON_THE_WAY,
            order: {
                orderId: 'order_1',
                orderStatus: client_1.OrderStatus.ON_THE_WAY,
            },
        }));
        const result = await service.markCurrentRiderOnTheWay(currentUser, {
            deliveryId: 'delivery_1',
        });
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', expect.objectContaining({
            status: client_1.OrderStatus.ON_THE_WAY,
            reasonCode: 'rider_on_the_way',
        }), {});
        expect(result).toMatchObject({
            status: client_1.DeliveryStatus.ON_THE_WAY,
        });
    });
    it('marks an in-transit delivery as failed with a required reason code', async () => {
        const { deliveriesRepository, ordersRepository, deliveryQueryService, service, } = makeService();
        deliveriesRepository.findRiderDeliveryById
            .mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.ON_THE_WAY,
            order: {
                status: client_1.OrderStatus.ON_THE_WAY,
            },
        }))
            .mockResolvedValueOnce(makeDeliveryRecord({
            status: client_1.DeliveryStatus.FAILED,
            order: {
                status: client_1.OrderStatus.FAILED_DELIVERY,
            },
            failedAt: new Date('2026-04-19T10:30:00.000Z'),
            failureReasonCode: 'customer_unreachable',
            failureNote: 'Phone unreachable',
        }));
        deliveriesRepository.updateById.mockResolvedValue({});
        ordersRepository.updateOrderStatus.mockResolvedValue({});
        deliveryQueryService.buildDeliveryDetail.mockReturnValue(makeDeliveryDetail({
            status: client_1.DeliveryStatus.FAILED,
            failureReasonCode: 'customer_unreachable',
            failureNote: 'Phone unreachable',
            order: {
                orderId: 'order_1',
                orderStatus: client_1.OrderStatus.FAILED_DELIVERY,
            },
        }));
        const result = await service.failCurrentRiderDelivery(currentUser, {
            deliveryId: 'delivery_1',
            reasonCode: 'customer_unreachable',
            note: 'Phone unreachable',
        });
        expect(deliveriesRepository.updateById).toHaveBeenCalledWith('delivery_1', expect.objectContaining({
            status: client_1.DeliveryStatus.FAILED,
            failureReasonCode: 'customer_unreachable',
            failureNote: 'Phone unreachable',
        }), {});
        expect(ordersRepository.updateOrderStatus).toHaveBeenCalledWith('order_1', expect.objectContaining({
            status: client_1.OrderStatus.FAILED_DELIVERY,
            reasonCode: 'customer_unreachable',
        }), {});
        expect(result).toMatchObject({
            status: client_1.DeliveryStatus.FAILED,
            failureReasonCode: 'customer_unreachable',
        });
    });
    it('rejects invalid rider delivery transitions', async () => {
        const { deliveriesRepository, service, } = makeService();
        deliveriesRepository.findRiderDeliveryById.mockResolvedValue(makeDeliveryRecord({
            status: client_1.DeliveryStatus.PICKED_UP,
            order: {
                status: client_1.OrderStatus.PICKED_UP,
            },
        }));
        await expect(service.acceptCurrentRiderDeliveryRequest(currentUser, {
            deliveryId: 'delivery_1',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
        });
    });
    it('rejects failed delivery requests without a reason code', async () => {
        const { deliveriesRepository, service, } = makeService();
        deliveriesRepository.findRiderDeliveryById.mockResolvedValue(makeDeliveryRecord({
            status: client_1.DeliveryStatus.ON_THE_WAY,
            order: {
                status: client_1.OrderStatus.ON_THE_WAY,
            },
        }));
        await expect(service.failCurrentRiderDelivery(currentUser, {
            deliveryId: 'delivery_1',
            reasonCode: '   ',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        });
    });
});
//# sourceMappingURL=rider-delivery-actions.service.spec.js.map