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
exports.MerchantOrdersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const merchant_order_action_dto_1 = require("../dto/merchant-order-action.dto");
const order_detail_dto_1 = require("../dto/order-detail.dto");
const order_summary_dto_1 = require("../dto/order-summary.dto");
const merchant_order_handling_service_1 = require("../services/merchant-order-handling.service");
const order_query_service_1 = require("../services/order-query.service");
let MerchantOrdersController = class MerchantOrdersController {
    constructor(orderQueryService, merchantOrderHandlingService) {
        this.orderQueryService = orderQueryService;
        this.merchantOrderHandlingService = merchantOrderHandlingService;
    }
    async list(currentUser, branchId) {
        const orders = await this.orderQueryService.listMerchantOrders(currentUser, {
            branchId,
        });
        return orders.map((order) => (0, order_summary_dto_1.toOrderSummaryDto)(order));
    }
    async detail(currentUser, orderId) {
        const order = await this.orderQueryService.getMerchantOrderDetail(currentUser, orderId);
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async accept(currentUser, orderId, body) {
        const order = await this.merchantOrderHandlingService.acceptCurrentMerchantOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async reject(currentUser, orderId, body) {
        const order = await this.merchantOrderHandlingService.rejectCurrentMerchantOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async markPreparing(currentUser, orderId, body) {
        const order = await this.merchantOrderHandlingService.markPreparingCurrentMerchantOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async markReady(currentUser, orderId, body) {
        const order = await this.merchantOrderHandlingService.markReadyCurrentMerchantOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async confirmPickup(currentUser, orderId, body) {
        const order = await this.merchantOrderHandlingService.confirmPickupCurrentMerchantOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
};
exports.MerchantOrdersController = MerchantOrdersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantOrders',
        summary: 'List merchant orders',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'branchId',
        required: false,
        description: 'Filter orders by branch. Omit to return orders for all branches.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns orders visible to the authenticated merchant scope.',
        type: order_summary_dto_1.OrderSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantOrderDetail',
        summary: 'Get merchant order details',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated merchant scope.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full order detail visible to the authenticated merchant scope.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Get)(':orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'acceptMerchantOrder',
        summary: 'Accept a merchant order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated merchant scope.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: merchant_order_action_dto_1.MerchantOrderActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Accepts an eligible merchant order and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/accept'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, merchant_order_action_dto_1.MerchantOrderActionDto]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "accept", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'rejectMerchantOrder',
        summary: 'Reject a merchant order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated merchant scope.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: merchant_order_action_dto_1.MerchantOrderActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Rejects an eligible merchant order and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, merchant_order_action_dto_1.MerchantOrderActionDto]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "reject", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markMerchantOrderPreparing',
        summary: 'Mark a merchant order as preparing',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated merchant scope.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: merchant_order_action_dto_1.MerchantOrderActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks an accepted merchant order as preparing and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/preparing'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, merchant_order_action_dto_1.MerchantOrderActionDto]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "markPreparing", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markMerchantOrderReady',
        summary: 'Mark a merchant order as ready for pickup',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated merchant scope.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: merchant_order_action_dto_1.MerchantOrderActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks a preparing merchant order as ready for rider pickup and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/ready'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, merchant_order_action_dto_1.MerchantOrderActionDto]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "markReady", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Confirm customer picked up a PICKUP order' }),
    (0, swagger_1.ApiParam)({ name: 'orderId', description: 'Order ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks a PICKUP order as DELIVERED when customer collects it.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/confirm-pickup'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, merchant_order_action_dto_1.MerchantOrderActionDto]),
    __metadata("design:returntype", Promise)
], MerchantOrdersController.prototype, "confirmPickup", null);
exports.MerchantOrdersController = MerchantOrdersController = __decorate([
    (0, swagger_1.ApiTags)('merchant-orders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/orders'),
    __metadata("design:paramtypes", [order_query_service_1.OrderQueryService,
        merchant_order_handling_service_1.MerchantOrderHandlingService])
], MerchantOrdersController);
//# sourceMappingURL=merchant-orders.controller.js.map