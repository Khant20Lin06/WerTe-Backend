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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerOrdersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const checkout_submission_dto_1 = require("../../checkout/dto/checkout-submission.dto");
const cancel_order_dto_1 = require("../dto/cancel-order.dto");
const create_order_dto_1 = require("../dto/create-order.dto");
const order_detail_dto_1 = require("../dto/order-detail.dto");
const order_summary_dto_1 = require("../dto/order-summary.dto");
const order_cancellation_service_1 = require("../services/order-cancellation.service");
const order_creation_service_1 = require("../services/order-creation.service");
const order_query_service_1 = require("../services/order-query.service");
let CustomerOrdersController = class CustomerOrdersController {
    constructor(orderCreationService, orderQueryService, orderCancellationService) {
        this.orderCreationService = orderCreationService;
        this.orderQueryService = orderQueryService;
        this.orderCancellationService = orderCancellationService;
    }
    async list(currentUser) {
        const orders = await this.orderQueryService.listCustomerOrders(currentUser);
        return orders.map((order) => (0, order_summary_dto_1.toOrderSummaryDto)(order));
    }
    async detail(currentUser, orderId) {
        const order = await this.orderQueryService.getCustomerOrderDetail(currentUser, orderId);
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async create(currentUser, body) {
        const submission = await this.orderCreationService.create(currentUser, body);
        return (0, checkout_submission_dto_1.toCheckoutSubmissionDto)(submission);
    }
    async cancel(currentUser, orderId, body) {
        const order = await this.orderCancellationService.cancelCurrentCustomerOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
};
exports.CustomerOrdersController = CustomerOrdersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCustomerOrders',
        summary: 'List customer orders',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns recent orders visible to the authenticated customer.',
        type: order_summary_dto_1.OrderSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", Promise)
], CustomerOrdersController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerOrderDetail',
        summary: 'Get customer order details',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full order detail visible to the authenticated customer.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Get)(':orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], CustomerOrdersController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createCustomerOrder',
        summary: 'Create a customer order',
    }),
    (0, swagger_1.ApiBody)({ type: create_order_dto_1.CreateOrderDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Submits the validated customer checkout and returns the created order snapshot.',
        type: checkout_submission_dto_1.CheckoutSubmissionDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], CustomerOrdersController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'cancelCustomerOrder',
        summary: 'Cancel a customer order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: cancel_order_dto_1.CancelOrderDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cancels an eligible customer order and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, cancel_order_dto_1.CancelOrderDto]),
    __metadata("design:returntype", Promise)
], CustomerOrdersController.prototype, "cancel", null);
exports.CustomerOrdersController = CustomerOrdersController = __decorate([
    (0, swagger_1.ApiTags)('customer-orders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/orders'),
    __metadata("design:paramtypes", [order_creation_service_1.OrderCreationService,
        order_query_service_1.OrderQueryService,
        order_cancellation_service_1.OrderCancellationService])
], CustomerOrdersController);
//# sourceMappingURL=customer-orders.controller.js.map