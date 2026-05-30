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
exports.OrderCancellationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const order_policy_service_1 = require("../policies/order-policy.service");
const orders_repository_1 = require("../repositories/orders.repository");
const order_query_service_1 = require("./order-query.service");
let OrderCancellationService = class OrderCancellationService {
    constructor(ordersRepository, orderPolicyService, orderQueryService, systemMessageService) {
        this.ordersRepository = ordersRepository;
        this.orderPolicyService = orderPolicyService;
        this.orderQueryService = orderQueryService;
        this.systemMessageService = systemMessageService;
    }
    async cancelCurrentCustomerOrder(currentUser, input) {
        const customerProfileId = currentUser.actorContext.customerProfileId;
        if (customerProfileId === undefined) {
            throw new app_exception_1.AppException('The authenticated actor does not have a customer profile scope.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const order = await this.ordersRepository.findCustomerOrderDetail(input.orderId, customerProfileId);
        if (order === null) {
            throw new app_exception_1.AppException('Order was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const orderDetail = this.orderQueryService.buildOrderDetail(order);
        if (orderDetail.status === client_1.OrderStatus.CANCELLED) {
            return this.orderQueryService.attachAvailableActions(currentUser, orderDetail);
        }
        if (!this.orderPolicyService.canCancelCustomerOrder(currentUser, orderDetail)) {
            throw new app_exception_1.AppException('This order can no longer be cancelled by the customer.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const cancelledOrder = await this.ordersRepository.updateOrderStatus(input.orderId, {
            status: client_1.OrderStatus.CANCELLED,
            fromStatus: order.status,
            changedByUserId: currentUser.userId,
            reasonCode: input.reasonCode ?? 'customer_cancelled',
            note: input.note ?? null,
        });
        await this.systemMessageService.publishOrderEvent(currentUser, {
            orderId: input.orderId,
            code: 'ORDER_CANCELLED',
            metadata: {
                actorUserId: currentUser.userId,
                reasonCode: input.reasonCode ?? 'customer_cancelled',
                note: input.note ?? null,
            },
            templateVariables: {
                reasonCode: input.reasonCode ?? 'customer_cancelled',
                note: input.note ?? null,
            },
        });
        return this.orderQueryService.attachAvailableActions(currentUser, this.orderQueryService.buildOrderDetail(cancelledOrder));
    }
};
exports.OrderCancellationService = OrderCancellationService;
exports.OrderCancellationService = OrderCancellationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository,
        order_policy_service_1.OrderPolicyService,
        order_query_service_1.OrderQueryService,
        system_message_service_1.SystemMessageService])
], OrderCancellationService);
//# sourceMappingURL=order-cancellation.service.js.map