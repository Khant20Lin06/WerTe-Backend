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
exports.AdminRefundsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const admin_finalize_refund_dto_1 = require("../dto/admin-finalize-refund.dto");
const admin_request_refund_dto_1 = require("../dto/admin-request-refund.dto");
const refund_summary_dto_1 = require("../dto/refund-summary.dto");
const refunds_rest_service_1 = require("../services/refunds-rest.service");
let AdminRefundsController = class AdminRefundsController {
    constructor(refundsRestService) {
        this.refundsRestService = refundsRestService;
    }
    async request(currentUser, paymentId, body) {
        const refund = await this.refundsRestService.requestCurrentAdminRefund(currentUser, paymentId, {
            amount: body.amount,
            idempotencyKey: body?.idempotencyKey,
            providerReference: body?.providerReference,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, refund_summary_dto_1.toRefundSummaryDto)(refund);
    }
    async succeed(currentUser, refundId, body) {
        const refund = await this.refundsRestService.succeedCurrentAdminRefund(currentUser, refundId, {
            providerReference: body?.providerReference,
            reasonCode: body?.reasonCode,
            failureCode: body?.failureCode,
            failureMessage: body?.failureMessage,
            note: body?.note,
        });
        return (0, refund_summary_dto_1.toRefundSummaryDto)(refund);
    }
    async fail(currentUser, refundId, body) {
        const refund = await this.refundsRestService.failCurrentAdminRefund(currentUser, refundId, {
            providerReference: body?.providerReference,
            reasonCode: body?.reasonCode,
            failureCode: body?.failureCode,
            failureMessage: body?.failureMessage,
            note: body?.note,
        });
        return (0, refund_summary_dto_1.toRefundSummaryDto)(refund);
    }
};
exports.AdminRefundsController = AdminRefundsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'requestAdminRefund',
        summary: 'Request a refund for a payment from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'Payment identifier visible to the administrative control plane.',
        example: 'payment_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_request_refund_dto_1.AdminRequestRefundDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Creates a refund request and returns the refund snapshot.',
        type: refund_summary_dto_1.RefundSummaryDto,
    }),
    (0, common_1.Post)('payments/:paymentId/refunds'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('paymentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_request_refund_dto_1.AdminRequestRefundDto]),
    __metadata("design:returntype", Promise)
], AdminRefundsController.prototype, "request", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'succeedAdminRefund',
        summary: 'Mark a refund as succeeded from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'refundId',
        description: 'Refund identifier visible to the administrative control plane.',
        example: 'refund_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_finalize_refund_dto_1.AdminFinalizeRefundDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the refund as succeeded and returns the updated refund snapshot.',
        type: refund_summary_dto_1.RefundSummaryDto,
    }),
    (0, common_1.Post)('refunds/:refundId/succeed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('refundId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_finalize_refund_dto_1.AdminFinalizeRefundDto]),
    __metadata("design:returntype", Promise)
], AdminRefundsController.prototype, "succeed", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'failAdminRefund',
        summary: 'Mark a refund as failed from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'refundId',
        description: 'Refund identifier visible to the administrative control plane.',
        example: 'refund_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_finalize_refund_dto_1.AdminFinalizeRefundDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the refund as failed and returns the updated refund snapshot.',
        type: refund_summary_dto_1.RefundSummaryDto,
    }),
    (0, common_1.Post)('refunds/:refundId/fail'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('refundId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_finalize_refund_dto_1.AdminFinalizeRefundDto]),
    __metadata("design:returntype", Promise)
], AdminRefundsController.prototype, "fail", null);
exports.AdminRefundsController = AdminRefundsController = __decorate([
    (0, swagger_1.ApiTags)('admin-refunds'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [refunds_rest_service_1.RefundsRestService])
], AdminRefundsController);
//# sourceMappingURL=admin-refunds.controller.js.map