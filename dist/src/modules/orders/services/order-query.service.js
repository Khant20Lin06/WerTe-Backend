"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderQueryService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const order_detail_entity_1 = require("../entities/order-detail.entity");
const order_summary_entity_1 = require("../entities/order-summary.entity");
const order_available_actions_helper_1 = require("../policies/order-available-actions.helper");
const order_policy_service_1 = require("../policies/order-policy.service");
const orders_repository_1 = require("../repositories/orders.repository");
let OrderQueryService = class OrderQueryService {
    constructor(ordersRepository, orderPolicyService) {
        this.ordersRepository = ordersRepository;
        this.orderPolicyService = orderPolicyService;
    }
    async listRecentOrders() {
        const orders = await this.ordersRepository.findRecentOrderSummaries();
        return orders.map((order) => this.buildOrderSummary(order));
    }
    async listCustomerOrders(currentUser) {
        const customerProfileId = this.requireCustomerProfileId(currentUser);
        const orders = await this.ordersRepository.findCustomerOrderSummaries(customerProfileId);
        return orders.map((order) => this.attachAvailableActions(currentUser, this.buildOrderSummary(order)));
    }
    async getCustomerOrderDetail(currentUser, orderId) {
        const customerProfileId = this.requireCustomerProfileId(currentUser);
        const order = await this.ordersRepository.findCustomerOrderDetail(orderId, customerProfileId);
        return this.mapRequiredOrderDetail(currentUser, orderId, order);
    }
    async listMerchantOrders(currentUser, options = {}) {
        const merchantId = this.requireMerchantId(currentUser);
        const orders = await this.ordersRepository.findMerchantOrderSummaries(merchantId, { branchId: options.branchId });
        return orders.map((order) => this.attachAvailableActions(currentUser, this.buildOrderSummary(order)));
    }
    async getMerchantOrderDetail(currentUser, orderId) {
        const merchantId = this.requireMerchantId(currentUser);
        const order = await this.ordersRepository.findMerchantOrderDetail(orderId, merchantId);
        return this.mapRequiredOrderDetail(currentUser, orderId, order);
    }
    async listRiderOrders(currentUser) {
        const riderId = this.requireRiderId(currentUser);
        const orders = await this.ordersRepository.findRiderOrderSummaries(riderId);
        return orders.map((order) => this.attachAvailableActions(currentUser, this.buildOrderSummary(order)));
    }
    async getRiderOrderDetail(currentUser, orderId) {
        const riderId = this.requireRiderId(currentUser);
        const order = await this.ordersRepository.findRiderOrderDetail(orderId, riderId);
        return this.mapRequiredOrderDetail(currentUser, orderId, order);
    }
    async listAdminOrders(currentUser) {
        if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
            throw this.buildForbidden('You are not allowed to view admin order data.');
        }
        const orders = await this.ordersRepository.findRecentOrderSummaries();
        return orders.map((order) => this.attachAvailableActions(currentUser, this.buildOrderSummary(order)));
    }
    async getAdminOrderDetail(currentUser, orderId) {
        if (!this.orderPolicyService.canViewAdminOrders(currentUser)) {
            throw this.buildForbidden('You are not allowed to view admin order data.');
        }
        const order = await this.ordersRepository.findOrderDetailById(orderId);
        return this.mapRequiredOrderDetail(currentUser, orderId, order);
    }
    buildOrderSummary(order) {
        return (0, order_summary_entity_1.buildOrderSummary)(order);
    }
    buildOrderDetail(order) {
        return (0, order_detail_entity_1.buildOrderDetail)(order);
    }
    buildOrderTimelineEntry(timelineEntry) {
        return (0, order_detail_entity_1.buildOrderTimelineEntry)(timelineEntry);
    }
    mapRequiredOrderDetail(currentUser, orderId, order) {
        if (order === null) {
            throw new app_exception_1.AppException('Order was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return this.attachAvailableActions(currentUser, this.buildOrderDetail(order));
    }
    attachAvailableActions(currentUser, order) {
        return {
            ...order,
            availableActions: (0, order_available_actions_helper_1.computeOrderAvailableActions)({
                currentUser,
                order,
                orderPolicyService: this.orderPolicyService,
            }),
        };
    }
    requireCustomerProfileId(currentUser) {
        const customerProfileId = currentUser.actorContext.customerProfileId;
        if (customerProfileId === undefined) {
            throw this.buildForbidden('The authenticated actor does not have a customer profile scope.');
        }
        return customerProfileId;
    }
    requireMerchantId(currentUser) {
        const merchantId = currentUser.actorContext.merchantId;
        if (merchantId === undefined) {
            throw this.buildForbidden('The authenticated actor does not have a merchant scope.');
        }
        return merchantId;
    }
    requireRiderId(currentUser) {
        const riderId = currentUser.actorContext.riderId;
        if (riderId === undefined) {
            throw this.buildForbidden('The authenticated actor does not have a rider scope.');
        }
        return riderId;
    }
    buildForbidden(message) {
        return new app_exception_1.AppException(message, common_1.HttpStatus.FORBIDDEN, {
            code: error_codes_1.ErrorCodes.forbidden,
        });
    }
};
exports.OrderQueryService = OrderQueryService;
exports.OrderQueryService = OrderQueryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository,
        order_policy_service_1.OrderPolicyService])
], OrderQueryService);
//# sourceMappingURL=order-query.service.js.map