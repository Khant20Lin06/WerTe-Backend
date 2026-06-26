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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRestService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const payment_detail_entity_1 = require("../entities/payment-detail.entity");
const finance_access_policy_helper_1 = require("../policies/finance-access-policy.helper");
const payment_lifecycle_service_1 = require("./payment-lifecycle.service");
const payments_service_1 = require("./payments.service");
let PaymentsRestService = class PaymentsRestService {
    constructor(paymentsService, paymentLifecycleService) {
        this.paymentsService = paymentsService;
        this.paymentLifecycleService = paymentLifecycleService;
    }
    listCurrentCustomerOrderPayments(currentUser, orderId) {
        return this.paymentsService.listCustomerOrderPayments(orderId, (0, finance_access_policy_helper_1.requireCustomerFinanceScope)(currentUser));
    }
    async getCurrentCustomerOrderPaymentDetail(currentUser, orderId, paymentId) {
        const payment = await this.paymentsService.findCustomerPayment((0, finance_access_policy_helper_1.requireCustomerFinanceScope)(currentUser), paymentId);
        return this.attachAttempts(orderId, paymentId, payment);
    }
    listCurrentAdminOrderPayments(orderId) {
        return this.paymentsService.listOrderPayments(orderId);
    }
    async getCurrentAdminOrderPaymentDetail(orderId, paymentId) {
        const payment = await this.paymentsService.findOrderPayment(orderId, paymentId);
        return this.attachAttempts(orderId, paymentId, payment);
    }
    confirmCurrentAdminPayment(currentUser, paymentId, payload) {
        return this.paymentLifecycleService.confirmCurrentPayment(currentUser, {
            paymentId,
            providerReference: payload.providerReference,
            providerReceiptId: payload.providerReceiptId,
            reasonCode: payload.reasonCode,
            note: payload.note,
        });
    }
    failCurrentAdminPayment(currentUser, paymentId, payload) {
        return this.paymentLifecycleService.failCurrentPayment(currentUser, {
            paymentId,
            providerReference: payload.providerReference,
            reasonCode: payload.reasonCode,
            failureCode: payload.failureCode,
            failureMessage: payload.failureMessage,
            note: payload.note,
        });
    }
    cancelCurrentAdminPayment(currentUser, paymentId, payload) {
        return this.paymentLifecycleService.cancelCurrentPayment(currentUser, {
            paymentId,
            providerReference: payload.providerReference,
            reasonCode: payload.reasonCode,
            note: payload.note,
        });
    }
    async attachAttempts(orderId, paymentId, payment) {
        if (payment === null || payment.order.orderId !== orderId) {
            throw new app_exception_1.AppException('Payment was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const attempts = await this.paymentsService.listPaymentAttempts(paymentId);
        return (0, payment_detail_entity_1.buildPaymentDetailEntity)(payment, attempts);
    }
};
exports.PaymentsRestService = PaymentsRestService;
exports.PaymentsRestService = PaymentsRestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        payment_lifecycle_service_1.PaymentLifecycleService])
], PaymentsRestService);
//# sourceMappingURL=payments-rest.service.js.map