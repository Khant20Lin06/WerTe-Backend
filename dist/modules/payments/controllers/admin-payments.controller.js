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
exports.AdminPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const admin_cancel_payment_dto_1 = require("../dto/admin-cancel-payment.dto");
const admin_confirm_payment_dto_1 = require("../dto/admin-confirm-payment.dto");
const admin_fail_payment_dto_1 = require("../dto/admin-fail-payment.dto");
const payment_summary_dto_1 = require("../dto/payment-summary.dto");
const payments_rest_service_1 = require("../services/payments-rest.service");
let AdminPaymentsController = class AdminPaymentsController {
    constructor(paymentsRestService) {
        this.paymentsRestService = paymentsRestService;
    }
    async confirm(currentUser, paymentId, body) {
        const payment = await this.paymentsRestService.confirmCurrentAdminPayment(currentUser, paymentId, {
            providerReference: body?.providerReference,
            providerReceiptId: body?.providerReceiptId,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, payment_summary_dto_1.toPaymentSummaryDto)(payment);
    }
    async fail(currentUser, paymentId, body) {
        const payment = await this.paymentsRestService.failCurrentAdminPayment(currentUser, paymentId, {
            providerReference: body?.providerReference,
            reasonCode: body?.reasonCode,
            failureCode: body?.failureCode,
            failureMessage: body?.failureMessage,
            note: body?.note,
        });
        return (0, payment_summary_dto_1.toPaymentSummaryDto)(payment);
    }
    async cancel(currentUser, paymentId, body) {
        const payment = await this.paymentsRestService.cancelCurrentAdminPayment(currentUser, paymentId, {
            providerReference: body?.providerReference,
            reasonCode: body?.reasonCode,
            note: body?.note,
        });
        return (0, payment_summary_dto_1.toPaymentSummaryDto)(payment);
    }
};
exports.AdminPaymentsController = AdminPaymentsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'confirmAdminPayment',
        summary: 'Confirm a payment from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'Payment identifier visible to the administrative control plane.',
        example: 'payment_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_confirm_payment_dto_1.AdminConfirmPaymentDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Confirms the payment and returns the updated payment snapshot.',
        type: payment_summary_dto_1.PaymentSummaryDto,
    }),
    (0, common_1.Post)(':paymentId/confirm'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('paymentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_confirm_payment_dto_1.AdminConfirmPaymentDto]),
    __metadata("design:returntype", Promise)
], AdminPaymentsController.prototype, "confirm", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'failAdminPayment',
        summary: 'Mark a payment as failed from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'Payment identifier visible to the administrative control plane.',
        example: 'payment_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_fail_payment_dto_1.AdminFailPaymentDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Marks the payment as failed and returns the updated payment snapshot.',
        type: payment_summary_dto_1.PaymentSummaryDto,
    }),
    (0, common_1.Post)(':paymentId/fail'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('paymentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_fail_payment_dto_1.AdminFailPaymentDto]),
    __metadata("design:returntype", Promise)
], AdminPaymentsController.prototype, "fail", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'cancelAdminPayment',
        summary: 'Cancel a payment from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'Payment identifier visible to the administrative control plane.',
        example: 'payment_1',
    }),
    (0, swagger_1.ApiBody)({ type: admin_cancel_payment_dto_1.AdminCancelPaymentDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cancels the payment and returns the updated payment snapshot.',
        type: payment_summary_dto_1.PaymentSummaryDto,
    }),
    (0, common_1.Post)(':paymentId/cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('paymentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, admin_cancel_payment_dto_1.AdminCancelPaymentDto]),
    __metadata("design:returntype", Promise)
], AdminPaymentsController.prototype, "cancel", null);
exports.AdminPaymentsController = AdminPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('admin-payments'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/payments'),
    __metadata("design:paramtypes", [payments_rest_service_1.PaymentsRestService])
], AdminPaymentsController);
//# sourceMappingURL=admin-payments.controller.js.map