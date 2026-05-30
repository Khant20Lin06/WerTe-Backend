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
exports.MerchantOrderHandlingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const order_policy_service_1 = require("../policies/order-policy.service");
const orders_repository_1 = require("../repositories/orders.repository");
const order_query_service_1 = require("./order-query.service");
let MerchantOrderHandlingService = class MerchantOrderHandlingService {
    constructor(ordersRepository, orderPolicyService, orderQueryService, systemMessageService) {
        this.ordersRepository = ordersRepository;
        this.orderPolicyService = orderPolicyService;
        this.orderQueryService = orderQueryService;
        this.systemMessageService = systemMessageService;
    }
    acceptCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.MERCHANT_ACCEPTED,
            defaultReasonCode: 'merchant_accepted',
            canTransition: (user, order) => this.orderPolicyService.canMerchantAccept(user, order),
            conflictMessage: 'This order can no longer be accepted by the merchant.',
        });
    }
    rejectCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.MERCHANT_REJECTED,
            defaultReasonCode: 'merchant_rejected',
            canTransition: (user, order) => this.orderPolicyService.canMerchantReject(user, order),
            conflictMessage: 'This order can no longer be rejected by the merchant.',
        });
    }
    markPreparingCurrentMerchantOrder(currentUser, input) {
        return this.handleMerchantAction(currentUser, input, {
            targetStatus: client_1.OrderStatus.PREPARING,
            defaultReasonCode: 'merchant_preparing',
            canTransition: (user, order) => this.orderPolicyService.canMarkPreparing(user, order),
            conflictMessage: 'This order cannot be marked as preparing by the merchant.',
        });
    }
    async handleMerchantAction(currentUser, input, config) {
        const merchantId = currentUser.actorContext.merchantId;
        if (merchantId === undefined) {
            throw new app_exception_1.AppException('The authenticated actor does not have a merchant scope.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const order = await this.ordersRepository.findMerchantOrderDetail(input.orderId, merchantId);
        if (order === null) {
            throw new app_exception_1.AppException('Order was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const orderDetail = this.orderQueryService.buildOrderDetail(order);
        if (orderDetail.status === config.targetStatus) {
            return this.orderQueryService.attachAvailableActions(currentUser, orderDetail);
        }
        if (!config.canTransition(currentUser, orderDetail)) {
            throw new app_exception_1.AppException(config.conflictMessage, common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const updatedOrder = await this.ordersRepository.updateOrderStatus(input.orderId, {
            status: config.targetStatus,
            fromStatus: order.status,
            changedByUserId: currentUser.userId,
            reasonCode: input.reasonCode ?? config.defaultReasonCode,
            note: input.note ?? null,
        });
        await this.systemMessageService.publishOrderEvent(currentUser, {
            orderId: input.orderId,
            code: this.mapStatusToSystemMessageCode(config.targetStatus),
            metadata: {
                actorUserId: currentUser.userId,
                targetStatus: config.targetStatus,
                reasonCode: input.reasonCode ?? config.defaultReasonCode,
                note: input.note ?? null,
            },
            templateVariables: {
                reasonCode: input.reasonCode ?? config.defaultReasonCode,
                note: input.note ?? null,
            },
        });
        return this.orderQueryService.attachAvailableActions(currentUser, this.orderQueryService.buildOrderDetail(updatedOrder));
    }
    mapStatusToSystemMessageCode(targetStatus) {
        switch (targetStatus) {
            case client_1.OrderStatus.MERCHANT_ACCEPTED:
                return 'ORDER_ACCEPTED';
            case client_1.OrderStatus.MERCHANT_REJECTED:
                return 'ORDER_REJECTED';
            case client_1.OrderStatus.PREPARING:
                return 'ORDER_PREPARING';
            default:
                return 'ADMIN_INTERVENTION';
        }
    }
};
exports.MerchantOrderHandlingService = MerchantOrderHandlingService;
exports.MerchantOrderHandlingService = MerchantOrderHandlingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository,
        order_policy_service_1.OrderPolicyService,
        order_query_service_1.OrderQueryService,
        system_message_service_1.SystemMessageService])
], MerchantOrderHandlingService);
//# sourceMappingURL=merchant-order-handling.service.js.map