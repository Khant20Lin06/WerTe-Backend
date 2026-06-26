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
exports.AdminOrderRefundsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const refund_summary_dto_1 = require("../dto/refund-summary.dto");
const refunds_rest_service_1 = require("../services/refunds-rest.service");
let AdminOrderRefundsController = class AdminOrderRefundsController {
    constructor(refundsRestService) {
        this.refundsRestService = refundsRestService;
    }
    async list(orderId) {
        const refunds = await this.refundsRestService.listCurrentAdminOrderRefunds(orderId);
        return refunds.map((refund) => (0, refund_summary_dto_1.toRefundSummaryDto)(refund));
    }
    async detail(orderId, refundId) {
        const refund = await this.refundsRestService.getCurrentAdminOrderRefundDetail(orderId, refundId);
        return (0, refund_summary_dto_1.toRefundDetailDto)(refund);
    }
};
exports.AdminOrderRefundsController = AdminOrderRefundsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminOrderRefunds',
        summary: 'List refunds for an order in the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns refunds linked to the administrative order view.',
        type: refund_summary_dto_1.RefundSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminOrderRefundsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminOrderRefundDetail',
        summary: 'Get refund detail in the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'refundId',
        description: 'Refund identifier linked to the administrative order view.',
        example: 'refund_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full administrative refund detail snapshot.',
        type: refund_summary_dto_1.RefundDetailDto,
    }),
    (0, common_1.Get)(':refundId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('refundId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminOrderRefundsController.prototype, "detail", null);
exports.AdminOrderRefundsController = AdminOrderRefundsController = __decorate([
    (0, swagger_1.ApiTags)('admin-order-refunds'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/orders/:orderId/refunds'),
    __metadata("design:paramtypes", [refunds_rest_service_1.RefundsRestService])
], AdminOrderRefundsController);
//# sourceMappingURL=admin-order-refunds.controller.js.map