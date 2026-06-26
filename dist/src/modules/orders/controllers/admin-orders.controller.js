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
exports.AdminOrdersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const admin_cancel_order_dto_1 = require("../dto/admin-cancel-order.dto");
const admin_update_order_status_dto_1 = require("../dto/admin-update-order-status.dto");
const order_detail_dto_1 = require("../dto/order-detail.dto");
const order_summary_dto_1 = require("../dto/order-summary.dto");
const admin_order_operations_service_1 = require("../services/admin-order-operations.service");
const order_query_service_1 = require("../services/order-query.service");
let AdminOrdersController = class AdminOrdersController {
    constructor(orderQueryService, adminOrderOperationsService) {
        this.orderQueryService = orderQueryService;
        this.adminOrderOperationsService = adminOrderOperationsService;
    }
    async list(currentUser) {
        const orders = await this.orderQueryService.listAdminOrders(currentUser);
        return orders.map((order) => (0, order_summary_dto_1.toOrderSummaryDto)(order));
    }
    async detail(currentUser, orderId) {
        const order = await this.orderQueryService.getAdminOrderDetail(currentUser, orderId);
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async cancel(currentUser, orderId, body) {
        const order = await this.adminOrderOperationsService.cancelAdminOrder(currentUser, {
            orderId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
    async updateStatus(currentUser, orderId, body) {
        const order = await this.adminOrderOperationsService.overrideAdminOrderStatus(currentUser, {
            orderId,
            status: body.status,
            reasonCode: body.reasonCode,
            note: body.note,
        });
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminOrders',
        summary: 'List admin-visible orders',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the admin order monitoring list.',
        type: order_summary_dto_1.OrderSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminOrderDetail',
        summary: 'Get admin order details',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full order detail visible to administrators.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Get)(':orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'cancelAdminOrder',
        summary: 'Cancel an order from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_cancel_order_dto_1.AdminCancelOrderDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cancels an eligible order through the administrative control path and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Post)(':orderId/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_cancel_order_dto_1.AdminCancelOrderDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "cancel", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateAdminOrderStatus',
        summary: 'Override order status as an admin action',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_update_order_status_dto_1.AdminUpdateOrderStatusDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Overrides an order status through the administrative control path and returns the updated order detail snapshot.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Patch)(':orderId/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_update_order_status_dto_1.AdminUpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], AdminOrdersController.prototype, "updateStatus", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, swagger_1.ApiTags)('admin-orders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/orders'),
    __metadata("design:paramtypes", [order_query_service_1.OrderQueryService,
        admin_order_operations_service_1.AdminOrderOperationsService])
], AdminOrdersController);
//# sourceMappingURL=admin-orders.controller.js.map