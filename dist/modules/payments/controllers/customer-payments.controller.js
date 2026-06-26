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
exports.CustomerPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const payment_summary_dto_1 = require("../dto/payment-summary.dto");
const payments_rest_service_1 = require("../services/payments-rest.service");
let CustomerPaymentsController = class CustomerPaymentsController {
    constructor(paymentsRestService) {
        this.paymentsRestService = paymentsRestService;
    }
    async list(currentUser, orderId) {
        const payments = await this.paymentsRestService.listCurrentCustomerOrderPayments(currentUser, orderId);
        return payments.map((payment) => (0, payment_summary_dto_1.toPaymentSummaryDto)(payment));
    }
    async detail(currentUser, orderId, paymentId) {
        const payment = await this.paymentsRestService.getCurrentCustomerOrderPaymentDetail(currentUser, orderId, paymentId);
        return (0, payment_summary_dto_1.toPaymentDetailDto)(payment);
    }
};
exports.CustomerPaymentsController = CustomerPaymentsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCustomerOrderPayments',
        summary: 'List payments for a customer order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns payments linked to the authenticated customer order.',
        type: payment_summary_dto_1.PaymentSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], CustomerPaymentsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerOrderPaymentDetail',
        summary: 'Get payment details for a customer order',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'Payment identifier linked to the authenticated customer order.',
        example: 'payment_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full payment detail visible to the authenticated customer.',
        type: payment_summary_dto_1.PaymentDetailDto,
    }),
    (0, common_1.Get)(':paymentId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", Promise)
], CustomerPaymentsController.prototype, "detail", null);
exports.CustomerPaymentsController = CustomerPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('customer-payments'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/orders/:orderId/payments'),
    __metadata("design:paramtypes", [payments_rest_service_1.PaymentsRestService])
], CustomerPaymentsController);
//# sourceMappingURL=customer-payments.controller.js.map