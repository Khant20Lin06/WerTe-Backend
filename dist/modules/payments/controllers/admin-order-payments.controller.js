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
exports.AdminOrderPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const payment_summary_dto_1 = require("../dto/payment-summary.dto");
const payments_rest_service_1 = require("../services/payments-rest.service");
let AdminOrderPaymentsController = class AdminOrderPaymentsController {
    constructor(paymentsRestService) {
        this.paymentsRestService = paymentsRestService;
    }
    async list(orderId) {
        const payments = await this.paymentsRestService.listCurrentAdminOrderPayments(orderId);
        return payments.map((payment) => (0, payment_summary_dto_1.toPaymentSummaryDto)(payment));
    }
    async detail(orderId, paymentId) {
        const payment = await this.paymentsRestService.getCurrentAdminOrderPaymentDetail(orderId, paymentId);
        return (0, payment_summary_dto_1.toPaymentDetailDto)(payment);
    }
};
exports.AdminOrderPaymentsController = AdminOrderPaymentsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminOrderPayments',
        summary: 'List payments for an order in the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns payments linked to the administrative order view.',
        type: payment_summary_dto_1.PaymentSummaryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminOrderPaymentsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminOrderPaymentDetail',
        summary: 'Get payment detail in the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the administrative control plane.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'Payment identifier linked to the administrative order view.',
        example: 'payment_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the full administrative payment detail snapshot.',
        type: payment_summary_dto_1.PaymentDetailDto,
    }),
    (0, common_1.Get)(':paymentId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminOrderPaymentsController.prototype, "detail", null);
exports.AdminOrderPaymentsController = AdminOrderPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('admin-order-payments'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/orders/:orderId/payments'),
    __metadata("design:paramtypes", [payments_rest_service_1.PaymentsRestService])
], AdminOrderPaymentsController);
//# sourceMappingURL=admin-order-payments.controller.js.map