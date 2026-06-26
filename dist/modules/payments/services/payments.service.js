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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const payment_attempt_entity_1 = require("../entities/payment-attempt.entity");
const payment_summary_entity_1 = require("../entities/payment-summary.entity");
const payments_repository_1 = require("../repositories/payments.repository");
let PaymentsService = class PaymentsService {
    constructor(paymentsRepository) {
        this.paymentsRepository = paymentsRepository;
    }
    async findPaymentById(paymentId) {
        const payment = await this.paymentsRepository.findById(paymentId);
        return payment === null ? null : (0, payment_summary_entity_1.buildPaymentSummaryEntity)(payment);
    }
    async findOrderPayment(orderId, paymentId) {
        const payment = await this.paymentsRepository.findOrderPayment(orderId, paymentId);
        return payment === null ? null : (0, payment_summary_entity_1.buildPaymentSummaryEntity)(payment);
    }
    async findCustomerPayment(customerProfileId, paymentId) {
        const payment = await this.paymentsRepository.findCustomerPayment(customerProfileId, paymentId);
        return payment === null ? null : (0, payment_summary_entity_1.buildPaymentSummaryEntity)(payment);
    }
    async listOrderPayments(orderId) {
        const payments = await this.paymentsRepository.findOrderPayments(orderId);
        return payments.map((payment) => (0, payment_summary_entity_1.buildPaymentSummaryEntity)(payment));
    }
    async listCustomerOrderPayments(orderId, customerProfileId) {
        const payments = await this.paymentsRepository.findCustomerOrderPayments(orderId, customerProfileId);
        return payments.map((payment) => (0, payment_summary_entity_1.buildPaymentSummaryEntity)(payment));
    }
    async findLatestOrderPayment(orderId) {
        const payment = await this.paymentsRepository.findLatestOrderPayment(orderId);
        return payment === null ? null : (0, payment_summary_entity_1.buildPaymentSummaryEntity)(payment);
    }
    async listPaymentAttempts(paymentId) {
        const attempts = await this.paymentsRepository.findPaymentAttempts(paymentId);
        return attempts.map((attempt) => (0, payment_attempt_entity_1.buildPaymentAttemptEntity)(attempt));
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map