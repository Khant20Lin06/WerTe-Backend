"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const order_available_actions_helper_1 = require("../../../../src/modules/orders/policies/order-available-actions.helper");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
function makeOrderSummary(overrides) {
    const base = {
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
            branchStatus: client_1.BranchStatus.ACTIVE,
            township: 'Botahtaung',
            merchantId: 'merchant_1',
            merchantUserId: 'usr_merchant_1',
            merchantName: 'Merchant One',
            merchantStatus: client_1.MerchantStatus.ACTIVE,
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
                status: client_1.RiderStatus.ACTIVE,
            },
        },
    };
    return {
        ...base,
        ...overrides,
        availableActions: overrides?.availableActions ?? base.availableActions,
    };
}
describe('order available actions helper', () => {
    const orderPolicyService = new order_policy_service_1.OrderPolicyService();
    it('returns cancel for a customer-owned cancellable order', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary(),
            orderPolicyService,
        })).toEqual([order_available_actions_helper_1.OrderAvailableActions.cancel]);
    });
    it('returns merchant accept and reject for a placed merchant-owned order', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary(),
            orderPolicyService,
        })).toEqual([
            order_available_actions_helper_1.OrderAvailableActions.merchantAccept,
            order_available_actions_helper_1.OrderAvailableActions.merchantReject,
        ]);
    });
    it('returns mark preparing for an accepted merchant-owned order', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                status: client_1.OrderStatus.MERCHANT_ACCEPTED,
            }),
            orderPolicyService,
        })).toEqual([order_available_actions_helper_1.OrderAvailableActions.markPreparing]);
    });
    it('returns accept and reject actions for rider-assigned rider-visible orders', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                status: client_1.OrderStatus.RIDER_ASSIGNED,
            }),
            orderPolicyService,
        })).toEqual([
            order_available_actions_helper_1.OrderAvailableActions.riderAcceptAssignment,
            order_available_actions_helper_1.OrderAvailableActions.riderRejectAssignment,
        ]);
    });
    it('returns delivery completion actions for in-transit rider orders', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                status: client_1.OrderStatus.ON_THE_WAY,
            }),
            orderPolicyService,
        })).toEqual([
            order_available_actions_helper_1.OrderAvailableActions.riderMarkDelivered,
            order_available_actions_helper_1.OrderAvailableActions.riderMarkFailedDelivery,
        ]);
    });
    it('returns admin cancel plus override for cancellable admin-visible orders', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                status: client_1.OrderStatus.RIDER_ASSIGNED,
            }),
            orderPolicyService,
        })).toEqual([
            order_available_actions_helper_1.OrderAvailableActions.adminCancel,
            order_available_actions_helper_1.OrderAvailableActions.adminOverrideStatus,
        ]);
    });
    it('returns admin assign rider for preparing admin-visible orders', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                status: client_1.OrderStatus.PREPARING,
            }),
            orderPolicyService,
        })).toEqual([
            order_available_actions_helper_1.OrderAvailableActions.adminAssignRider,
            order_available_actions_helper_1.OrderAvailableActions.adminCancel,
            order_available_actions_helper_1.OrderAvailableActions.adminOverrideStatus,
        ]);
    });
    it('returns only admin override for delivered admin-visible orders', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                status: client_1.OrderStatus.DELIVERED,
            }),
            orderPolicyService,
        })).toEqual([order_available_actions_helper_1.OrderAvailableActions.adminOverrideStatus]);
    });
    it('returns no actions when the actor cannot access the order resource', () => {
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
        expect((0, order_available_actions_helper_1.computeOrderAvailableActions)({
            currentUser,
            order: makeOrderSummary({
                customer: {
                    customerProfileId: 'cust_prof_2',
                    userId: 'usr_customer_2',
                    phone: '0991111111',
                    userStatus: client_1.UserStatus.ACTIVE,
                    fullName: 'Other Customer',
                    avatarUrl: null,
                },
            }),
            orderPolicyService,
        })).toEqual([]);
    });
});
//# sourceMappingURL=order-available-actions.helper.spec.js.map