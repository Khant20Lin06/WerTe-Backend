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
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const refund_attempt_entity_1 = require("../entities/refund-attempt.entity");
const refund_summary_entity_1 = require("../entities/refund-summary.entity");
const refunds_repository_1 = require("../repositories/refunds.repository");
let RefundsService = class RefundsService {
    constructor(refundsRepository) {
        this.refundsRepository = refundsRepository;
    }
    async findRefundById(refundId) {
        const refund = await this.refundsRepository.findById(refundId);
        return refund === null ? null : (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund);
    }
    async findOrderRefund(orderId, refundId) {
        const refund = await this.refundsRepository.findOrderRefund(orderId, refundId);
        return refund === null ? null : (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund);
    }
    async findCustomerRefund(customerProfileId, refundId) {
        const refund = await this.refundsRepository.findCustomerRefund(customerProfileId, refundId);
        return refund === null ? null : (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund);
    }
    async listOrderRefunds(orderId) {
        const refunds = await this.refundsRepository.findOrderRefunds(orderId);
        return refunds.map((refund) => (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund));
    }
    async listCustomerOrderRefunds(orderId, customerProfileId) {
        const refunds = await this.refundsRepository.findCustomerOrderRefunds(orderId, customerProfileId);
        return refunds.map((refund) => (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund));
    }
    async listPaymentRefunds(paymentId) {
        const refunds = await this.refundsRepository.findPaymentRefunds(paymentId);
        return refunds.map((refund) => (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund));
    }
    async listRefundAttempts(refundId) {
        const attempts = await this.refundsRepository.findRefundAttempts(refundId);
        return attempts.map((attempt) => (0, refund_attempt_entity_1.buildRefundAttemptEntity)(attempt));
    }
};
exports.RefundsService = RefundsService;
exports.RefundsService = RefundsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [refunds_repository_1.RefundsRepository])
], RefundsService);
//# sourceMappingURL=refunds.service.js.map