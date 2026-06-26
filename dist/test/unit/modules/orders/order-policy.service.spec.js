"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const order_policy_service_1 = require("../../../../src/modules/orders/policies/order-policy.service");
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
describe('OrderPolicyService', () => {
    const service = new order_policy_service_1.OrderPolicyService();
    it('allows customers to view only their own orders', () => {
        const customerUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        expect(service.canViewOrder(customerUser, makeOrderSummary())).toBe(true);
        expect(service.canViewOrder(customerUser, makeOrderSummary({
            customer: {
                customerProfileId: 'cust_prof_2',
                userId: 'usr_customer_2',
                phone: '0991111111',
                userStatus: client_1.UserStatus.ACTIVE,
                fullName: 'Other Customer',
                avatarUrl: null,
            },
        }))).toBe(false);
    });
    it('allows merchants to view only orders from their own merchant scope', () => {
        const merchantUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        expect(service.canViewOrder(merchantUser, makeOrderSummary())).toBe(true);
        expect(service.canViewOrder(merchantUser, makeOrderSummary({
            branch: {
                branchId: 'branch_2',
                branchName: 'Other Branch',
                branchStatus: client_1.BranchStatus.ACTIVE,
                township: 'Tamwe',
                merchantId: 'merchant_2',
                merchantUserId: 'usr_merchant_2',
                merchantName: 'Other Merchant',
                merchantStatus: client_1.MerchantStatus.ACTIVE,
            },
        }))).toBe(false);
    });
    it('allows riders to view only assigned delivery orders', () => {
        const riderUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        expect(service.canViewOrder(riderUser, makeOrderSummary())).toBe(true);
        expect(service.canViewOrder(riderUser, makeOrderSummary({
            delivery: null,
        }))).toBe(false);
    });
    it('allows admins to view any order and override statuses', () => {
        const adminUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
            actorContext: {
                userId: 'usr_admin_1',
                phone: '0990000000',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
        expect(service.canViewOrder(adminUser, makeOrderSummary())).toBe(true);
        expect(service.canViewAdminOrders(adminUser)).toBe(true);
        expect(service.canAdminCancelOrder(adminUser, makeOrderSummary())).toBe(true);
        expect(service.canAdminOverrideStatus(adminUser)).toBe(true);
        expect(service.canAdminAssignRider(adminUser, makeOrderSummary({
            status: client_1.OrderStatus.PREPARING,
        }))).toBe(true);
        expect(service.canAdminCancelOrder(adminUser, makeOrderSummary({
            status: client_1.OrderStatus.DELIVERED,
        }))).toBe(false);
        expect(service.canAdminAssignRider(adminUser, makeOrderSummary({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        }))).toBe(false);
    });
    it('allows customer cancellation only before fulfillment progresses too far', () => {
        const customerUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        expect(service.canCancelCustomerOrder(customerUser, makeOrderSummary())).toBe(true);
        expect(service.canCancelCustomerOrder(customerUser, makeOrderSummary({
            status: client_1.OrderStatus.ON_THE_WAY,
        }))).toBe(false);
    });
    it('allows merchant accept/reject only from placed state and preparing only after acceptance', () => {
        const merchantUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        expect(service.canMerchantAccept(merchantUser, makeOrderSummary())).toBe(true);
        expect(service.canMerchantReject(merchantUser, makeOrderSummary())).toBe(true);
        expect(service.canMarkPreparing(merchantUser, makeOrderSummary())).toBe(false);
        expect(service.canMarkPreparing(merchantUser, makeOrderSummary({
            status: client_1.OrderStatus.MERCHANT_ACCEPTED,
        }))).toBe(true);
    });
    it('allows rider actions only across the supported fulfillment progression', () => {
        const riderUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
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
        expect(service.canRiderAcceptAssignment(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        }))).toBe(true);
        expect(service.canRiderRejectAssignment(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.RIDER_ASSIGNED,
        }))).toBe(true);
        expect(service.canRiderMarkPickedUp(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.RIDER_ACCEPTED,
        }))).toBe(true);
        expect(service.canRiderMarkOnTheWay(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.PICKED_UP,
        }))).toBe(true);
        expect(service.canRiderMarkDelivered(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.ON_THE_WAY,
        }))).toBe(true);
        expect(service.canRiderMarkFailedDelivery(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.PICKED_UP,
        }))).toBe(true);
        expect(service.canRiderMarkFailedDelivery(riderUser, makeOrderSummary({
            status: client_1.OrderStatus.RIDER_ACCEPTED,
        }))).toBe(false);
    });
});
//# sourceMappingURL=order-policy.service.spec.js.map