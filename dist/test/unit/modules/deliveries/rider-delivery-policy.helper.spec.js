"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const rider_delivery_policy_helper_1 = require("../../../../src/modules/deliveries/policies/rider-delivery-policy.helper");
function makeDelivery(overrides) {
    return {
        riderId: 'rider_1',
        status: client_1.DeliveryStatus.ASSIGNED,
        order: {
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        },
        ...overrides,
    };
}
describe('rider delivery policy helper', () => {
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
    it('allows rider accept and reject only for assigned deliveries owned by the rider', () => {
        expect((0, rider_delivery_policy_helper_1.canRiderAcceptDeliveryRequest)(currentUser, makeDelivery())).toBe(true);
        expect((0, rider_delivery_policy_helper_1.canRiderRejectDeliveryRequest)(currentUser, makeDelivery())).toBe(true);
        expect((0, rider_delivery_policy_helper_1.canRiderAcceptDeliveryRequest)(currentUser, makeDelivery({
            riderId: 'rider_2',
        }))).toBe(false);
        expect((0, rider_delivery_policy_helper_1.canRiderRejectDeliveryRequest)(currentUser, makeDelivery({
            status: client_1.DeliveryStatus.ACCEPTED,
        }))).toBe(false);
    });
    it('allows pickup, on-the-way, delivered, and failed transitions only in valid states', () => {
        expect((0, rider_delivery_policy_helper_1.canRiderMarkDeliveryPickedUp)(currentUser, makeDelivery({
            status: client_1.DeliveryStatus.ACCEPTED,
            order: {
                status: client_1.OrderStatus.RIDER_ACCEPTED,
            },
        }))).toBe(true);
        expect((0, rider_delivery_policy_helper_1.canRiderMarkDeliveryOnTheWay)(currentUser, makeDelivery({
            status: client_1.DeliveryStatus.PICKED_UP,
            order: {
                status: client_1.OrderStatus.PICKED_UP,
            },
        }))).toBe(true);
        expect((0, rider_delivery_policy_helper_1.canRiderMarkDeliveryDelivered)(currentUser, makeDelivery({
            status: client_1.DeliveryStatus.ON_THE_WAY,
            order: {
                status: client_1.OrderStatus.ON_THE_WAY,
            },
        }))).toBe(true);
        expect((0, rider_delivery_policy_helper_1.canRiderMarkDeliveryFailed)(currentUser, makeDelivery({
            status: client_1.DeliveryStatus.PICKED_UP,
            order: {
                status: client_1.OrderStatus.PICKED_UP,
            },
        }))).toBe(true);
        expect((0, rider_delivery_policy_helper_1.canRiderMarkDeliveryFailed)(currentUser, makeDelivery({
            status: client_1.DeliveryStatus.ACCEPTED,
            order: {
                status: client_1.OrderStatus.RIDER_ACCEPTED,
            },
        }))).toBe(false);
    });
});
//# sourceMappingURL=rider-delivery-policy.helper.spec.js.map