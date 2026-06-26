"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const order_access_policy_helper_1 = require("../../../../src/modules/orders/policies/order-access-policy.helper");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
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
describe('order access policy helper', () => {
    it('allows customer order access when user and scoped profile match', () => {
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
        expect((0, order_access_policy_helper_1.hasCustomerOrderAccess)({
            currentUser,
            order: makeOrderSummary(),
        })).toBe(true);
    });
    it('denies merchant order access when merchant scope mismatches', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0942000000',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_2',
            },
        });
        expect((0, order_access_policy_helper_1.hasMerchantOrderAccess)({
            currentUser,
            order: makeOrderSummary(),
        })).toBe(false);
    });
    it('denies rider order access when no assigned rider context exists', () => {
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
        expect((0, order_access_policy_helper_1.hasRiderOrderAccess)({
            currentUser,
            order: makeOrderSummary({
                delivery: null,
            }),
        })).toBe(false);
    });
});
//# sourceMappingURL=order-access-policy.helper.spec.js.map