"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_deliveries_controller_1 = require("../../../../src/modules/deliveries/controllers/rider-deliveries.controller");
function makeDeliveryDetail(status = client_1.DeliveryStatus.ASSIGNED) {
    return {
        deliveryId: 'delivery_1',
        orderId: 'order_1',
        riderId: 'rider_1',
        status,
        etaMinutes: 18,
        assignedAt: '2026-04-19T10:10:00.000Z',
        acceptedAt: status === client_1.DeliveryStatus.ACCEPTED ? '2026-04-19T10:12:00.000Z' : null,
        pickedUpAt: null,
        onTheWayAt: null,
        deliveredAt: null,
        failedAt: null,
        cancelledAt: null,
        failureReasonCode: null,
        failureNote: null,
        createdAt: '2026-04-19T10:10:00.000Z',
        updatedAt: '2026-04-19T10:10:00.000Z',
        order: {
            orderId: 'order_1',
            orderCode: 'ORD-00000001',
            orderStatus: status === client_1.DeliveryStatus.ACCEPTED
                ? client_1.OrderStatus.RIDER_ACCEPTED
                : client_1.OrderStatus.RIDER_ASSIGNED,
            currencyCode: 'MMK',
            subtotalAmount: '6500',
            discountAmount: '0',
            deliveryFee: '500',
            totalAmount: '7000',
            placedAt: '2026-04-19T10:00:00.000Z',
            updatedAt: '2026-04-19T10:10:00.000Z',
            customer: {
                customerProfileId: 'cust_prof_1',
                userId: 'usr_customer_1',
                phone: '09123456789',
                userStatus: client_1.UserStatus.ACTIVE,
                fullName: 'Mg Mg',
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
            deliveryAddress: {
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
        },
        rider: {
            riderId: 'rider_1',
            userId: 'usr_rider_1',
            phone: '0999999999',
            userStatus: client_1.UserStatus.ACTIVE,
            displayName: 'Ko Aung',
            vehicleType: 'bike',
            currentTownship: 'Pabedan',
            status: client_1.RiderStatus.ACTIVE,
            availability: null,
            currentLocation: null,
        },
    };
}
describe('RiderDeliveriesController', () => {
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
    it('delegates active and detail delivery reads to the delivery query service', async () => {
        const deliveryQueryService = {
            getRiderActiveDelivery: jest.fn().mockResolvedValue(makeDeliveryDetail()),
            getRiderDeliveryDetail: jest.fn().mockResolvedValue(makeDeliveryDetail()),
        };
        const riderDeliveryActionsService = {};
        const controller = new rider_deliveries_controller_1.RiderDeliveriesController(deliveryQueryService, riderDeliveryActionsService);
        const active = await controller.active(currentUser);
        const detail = await controller.detail(currentUser, 'delivery_1');
        expect(deliveryQueryService.getRiderActiveDelivery).toHaveBeenCalledWith(currentUser);
        expect(deliveryQueryService.getRiderDeliveryDetail).toHaveBeenCalledWith(currentUser, 'delivery_1');
        expect(active).toMatchObject({ deliveryId: 'delivery_1' });
        expect(detail).toMatchObject({ deliveryId: 'delivery_1' });
    });
    it('delegates rider request accept and reject actions to the action service', async () => {
        const deliveryQueryService = {};
        const riderDeliveryActionsService = {
            acceptCurrentRiderDeliveryRequest: jest
                .fn()
                .mockResolvedValue(makeDeliveryDetail(client_1.DeliveryStatus.ACCEPTED)),
            rejectCurrentRiderDeliveryRequest: jest
                .fn()
                .mockResolvedValue(makeDeliveryDetail(client_1.DeliveryStatus.PENDING_ASSIGNMENT)),
        };
        const controller = new rider_deliveries_controller_1.RiderDeliveriesController(deliveryQueryService, riderDeliveryActionsService);
        const accepted = await controller.accept(currentUser, 'delivery_1');
        const rejected = await controller.reject(currentUser, 'delivery_1', {
            reasonCode: 'rider_rejected_assignment',
            note: 'Too far away.',
        });
        expect(riderDeliveryActionsService.acceptCurrentRiderDeliveryRequest).toHaveBeenCalledWith(currentUser, {
            deliveryId: 'delivery_1',
        });
        expect(riderDeliveryActionsService.rejectCurrentRiderDeliveryRequest).toHaveBeenCalledWith(currentUser, {
            deliveryId: 'delivery_1',
            reasonCode: 'rider_rejected_assignment',
            note: 'Too far away.',
        });
        expect(accepted).toMatchObject({ status: client_1.DeliveryStatus.ACCEPTED });
        expect(rejected).toMatchObject({ status: client_1.DeliveryStatus.PENDING_ASSIGNMENT });
    });
    it('delegates fulfillment progression actions to the action service', async () => {
        const deliveryQueryService = {};
        const riderDeliveryActionsService = {
            markCurrentRiderPickedUp: jest
                .fn()
                .mockResolvedValue(makeDeliveryDetail(client_1.DeliveryStatus.PICKED_UP)),
            markCurrentRiderOnTheWay: jest
                .fn()
                .mockResolvedValue(makeDeliveryDetail(client_1.DeliveryStatus.ON_THE_WAY)),
            markCurrentRiderDelivered: jest
                .fn()
                .mockResolvedValue(makeDeliveryDetail(client_1.DeliveryStatus.DELIVERED)),
            failCurrentRiderDelivery: jest
                .fn()
                .mockResolvedValue(makeDeliveryDetail(client_1.DeliveryStatus.FAILED)),
        };
        const controller = new rider_deliveries_controller_1.RiderDeliveriesController(deliveryQueryService, riderDeliveryActionsService);
        await controller.markPickedUp(currentUser, 'delivery_1');
        await controller.markOnTheWay(currentUser, 'delivery_1');
        await controller.markDelivered(currentUser, 'delivery_1');
        const failed = await controller.markFailed(currentUser, 'delivery_1', {
            reasonCode: 'customer_unreachable',
            note: 'Phone unreachable',
        });
        expect(riderDeliveryActionsService.markCurrentRiderPickedUp).toHaveBeenCalledWith(currentUser, {
            deliveryId: 'delivery_1',
        });
        expect(riderDeliveryActionsService.markCurrentRiderOnTheWay).toHaveBeenCalledWith(currentUser, {
            deliveryId: 'delivery_1',
        });
        expect(riderDeliveryActionsService.markCurrentRiderDelivered).toHaveBeenCalledWith(currentUser, {
            deliveryId: 'delivery_1',
        });
        expect(riderDeliveryActionsService.failCurrentRiderDelivery).toHaveBeenCalledWith(currentUser, {
            deliveryId: 'delivery_1',
            reasonCode: 'customer_unreachable',
            note: 'Phone unreachable',
        });
        expect(failed).toMatchObject({ status: client_1.DeliveryStatus.FAILED });
    });
});
//# sourceMappingURL=rider-deliveries.controller.spec.js.map