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
exports.CustomerRefundsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const refund_summary_dto_1 = require("../dto/refund-summary.dto");
const refunds_rest_service_1 = require("../services/refunds-rest.service");
let CustomerRefundsController = class CustomerRefundsController {
    constructor(refundsRestService) {
        this.refundsRestService = refundsRestService;
    }
    async list(currentUser, orderId) {
        const refunds = await this.refundsRestService.listCurrentCustomerOrderRefunds(currentUser, orderId);
        return refunds.map((refund) => (0, refund_summary_dto_1.toRefundSummaryDto)(refund));
    }
    async detail(currentUser, orderId, refundId) {
        const refund = await this.refundsRestService.getCurrentCustomerOrderRefundDetail(currentUser, orderId, refundId);
        return (0, refund_summary_dto_1.toRefundDetailDto)(refund);
    }
};
exports.CustomerRefundsController = CustomerRefundsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCustomerOrderRefunds',
        summary: 'List refunds for a customer order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns refunds linked to the authenticated customer order.',
        type: refund_summary_dto_1.RefundSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], CustomerRefundsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerOrderRefundDetail',
        summary: 'Get refund details for a customer order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'refundId',
        description: 'Refund identifier linked to the authenticated customer order.',
        example: 'refund_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full refund detail visible to the authenticated customer.',
        type: refund_summary_dto_1.RefundDetailDto,
    }),
    (0, common_1.Get)(':refundId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Param)('refundId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", Promise)
], CustomerRefundsController.prototype, "detail", null);
exports.CustomerRefundsController = CustomerRefundsController = __decorate([
    (0, swagger_1.ApiTags)('customer-refunds'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/orders/:orderId/refunds'),
    __metadata("design:paramtypes", [refunds_rest_service_1.RefundsRestService])
], CustomerRefundsController);
//# sourceMappingURL=customer-refunds.controller.js.map