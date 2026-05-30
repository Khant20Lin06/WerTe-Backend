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
exports.RiderOrdersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const order_detail_dto_1 = require("../dto/order-detail.dto");
const order_summary_dto_1 = require("../dto/order-summary.dto");
const order_query_service_1 = require("../services/order-query.service");
let RiderOrdersController = class RiderOrdersController {
    constructor(orderQueryService) {
        this.orderQueryService = orderQueryService;
    }
    async list(currentUser) {
        const orders = await this.orderQueryService.listRiderOrders(currentUser);
        return orders.map((order) => (0, order_summary_dto_1.toOrderSummaryDto)(order));
    }
    async detail(currentUser, orderId) {
        const order = await this.orderQueryService.getRiderOrderDetail(currentUser, orderId);
        return (0, order_detail_dto_1.toOrderDetailDto)(order);
    }
};
exports.RiderOrdersController = RiderOrdersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listRiderOrders',
        summary: 'List rider-visible orders',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns orders visible to the authenticated rider, including active delivery context.',
        type: order_summary_dto_1.OrderSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", Promise)
], RiderOrdersController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getRiderOrderDetail',
        summary: 'Get rider order details',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated rider.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full order detail visible to the authenticated rider.',
        type: order_detail_dto_1.OrderDetailDto,
    }),
    (0, common_1.Get)(':orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], RiderOrdersController.prototype, "detail", null);
exports.RiderOrdersController = RiderOrdersController = __decorate([
    (0, swagger_1.ApiTags)('rider-orders'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.RIDER),
    (0, common_1.Controller)('rider/orders'),
    __metadata("design:paramtypes", [order_query_service_1.OrderQueryService])
], RiderOrdersController);
//# sourceMappingURL=rider-orders.controller.js.map