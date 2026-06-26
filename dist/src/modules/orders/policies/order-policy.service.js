"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPolicyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
const order_access_policy_helper_1 = require("./order-access-policy.helper");
const CUSTOMER_CANCELLABLE_STATUSES = new Set([
    client_1.OrderStatus.PLACED,
    client_1.OrderStatus.MERCHANT_ACCEPTED,
    client_1.OrderStatus.PREPARING,
    client_1.OrderStatus.READY,
]);
const ADMIN_CANCELLABLE_STATUSES = new Set([
    client_1.OrderStatus.PLACED,
    client_1.OrderStatus.MERCHANT_ACCEPTED,
    client_1.OrderStatus.PREPARING,
    client_1.OrderStatus.READY,
    client_1.OrderStatus.RIDER_ASSIGNED,
    client_1.OrderStatus.RIDER_ACCEPTED,
    client_1.OrderStatus.PICKED_UP,
    client_1.OrderStatus.ON_THE_WAY,
]);
const RIDER_FAILABLE_STATUSES = new Set([
    client_1.OrderStatus.PICKED_UP,
    client_1.OrderStatus.ON_THE_WAY,
]);
let OrderPolicyService = class OrderPolicyService {
    canViewCustomerOrders(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.CUSTOMER);
    }
    canViewMerchantOrders(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.MERCHANT);
    }
    canViewRiderOrders(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.RIDER);
    }
    canViewAdminOrders(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.ADMIN);
    }
    canViewOrder(currentUser, order) {
        return (this.canViewAdminOrders(currentUser) ||
            (0, order_access_policy_helper_1.hasCustomerOrderAccess)({ currentUser, order }) ||
            (0, order_access_policy_helper_1.hasMerchantOrderAccess)({ currentUser, order }) ||
            (0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }));
    }
    canCancelCustomerOrder(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasCustomerOrderAccess)({ currentUser, order }) &&
            CUSTOMER_CANCELLABLE_STATUSES.has(order.status));
    }
    canMerchantAccept(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasMerchantOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.PLACED);
    }
    canMerchantReject(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasMerchantOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.PLACED);
    }
    canMarkPreparing(currentUser, order) {
        if (!(0, order_access_policy_helper_1.hasMerchantOrderAccess)({ currentUser, order }))
            return false;
        if (order.deliveryType === client_1.DeliveryType.PICKUP) {
            return order.status === client_1.OrderStatus.MERCHANT_ACCEPTED;
        }
        return order.status === client_1.OrderStatus.RIDER_ACCEPTED;
    }
    canMarkReady(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasMerchantOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.PREPARING);
    }
    canRiderAcceptAssignment(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.RIDER_ASSIGNED);
    }
    canRiderRejectAssignment(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.RIDER_ASSIGNED);
    }
    canRiderMarkPickedUp(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.READY);
    }
    canRiderMarkOnTheWay(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.PICKED_UP);
    }
    canRiderMarkDelivered(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }) &&
            order.status === client_1.OrderStatus.ON_THE_WAY);
    }
    canRiderMarkFailedDelivery(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasRiderOrderAccess)({ currentUser, order }) &&
            RIDER_FAILABLE_STATUSES.has(order.status));
    }
    canAdminOverrideStatus(currentUser) {
        return (0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.ADMIN);
    }
    canAdminAssignRider(currentUser, order) {
        return (this.canViewAdminOrders(currentUser) &&
            (order.status === client_1.OrderStatus.MERCHANT_ACCEPTED ||
                order.status === client_1.OrderStatus.RIDER_ASSIGNED));
    }
    canAdminCancelOrder(currentUser, order) {
        return (this.canViewAdminOrders(currentUser) &&
            ADMIN_CANCELLABLE_STATUSES.has(order.status));
    }
    canMerchantConfirmPickup(currentUser, order) {
        return ((0, order_access_policy_helper_1.hasMerchantOrderAccess)({ currentUser, order }) &&
            order.deliveryType === client_1.DeliveryType.PICKUP &&
            order.status === client_1.OrderStatus.READY);
    }
};
exports.OrderPolicyService = OrderPolicyService;
exports.OrderPolicyService = OrderPolicyService = __decorate([
    (0, common_1.Injectable)()
], OrderPolicyService);
//# sourceMappingURL=order-policy.service.js.map