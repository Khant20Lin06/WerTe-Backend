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
exports.RefundsRestService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const finance_access_policy_helper_1 = require("../../payments/policies/finance-access-policy.helper");
const refund_detail_entity_1 = require("../entities/refund-detail.entity");
const refund_operations_service_1 = require("./refund-operations.service");
const refunds_service_1 = require("./refunds.service");
let RefundsRestService = class RefundsRestService {
    constructor(refundsService, refundOperationsService) {
        this.refundsService = refundsService;
        this.refundOperationsService = refundOperationsService;
    }
    listCurrentCustomerOrderRefunds(currentUser, orderId) {
        return this.refundsService.listCustomerOrderRefunds(orderId, (0, finance_access_policy_helper_1.requireCustomerFinanceScope)(currentUser));
    }
    async getCurrentCustomerOrderRefundDetail(currentUser, orderId, refundId) {
        const refund = await this.refundsService.findCustomerRefund((0, finance_access_policy_helper_1.requireCustomerFinanceScope)(currentUser), refundId);
        return this.attachAttempts(orderId, refundId, refund);
    }
    listCurrentAdminOrderRefunds(orderId) {
        return this.refundsService.listOrderRefunds(orderId);
    }
    async getCurrentAdminOrderRefundDetail(orderId, refundId) {
        const refund = await this.refundsService.findOrderRefund(orderId, refundId);
        return this.attachAttempts(orderId, refundId, refund);
    }
    requestCurrentAdminRefund(currentUser, paymentId, payload) {
        return this.refundOperationsService.requestCurrentAdminRefund(currentUser, {
            paymentId,
            amount: payload.amount,
            idempotencyKey: payload.idempotencyKey,
            providerReference: payload.providerReference,
            reasonCode: payload.reasonCode,
            note: payload.note,
        });
    }
    succeedCurrentAdminRefund(currentUser, refundId, payload) {
        return this.refundOperationsService.succeedCurrentAdminRefund(currentUser, {
            refundId,
            providerReference: payload.providerReference,
            reasonCode: payload.reasonCode,
            failureCode: payload.failureCode,
            failureMessage: payload.failureMessage,
            note: payload.note,
        });
    }
    failCurrentAdminRefund(currentUser, refundId, payload) {
        return this.refundOperationsService.failCurrentAdminRefund(currentUser, {
            refundId,
            providerReference: payload.providerReference,
            reasonCode: payload.reasonCode,
            failureCode: payload.failureCode,
            failureMessage: payload.failureMessage,
            note: payload.note,
        });
    }
    async attachAttempts(orderId, refundId, refund) {
        if (refund === null || refund.order.orderId !== orderId) {
            throw new app_exception_1.AppException('Refund was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const attempts = await this.refundsService.listRefundAttempts(refundId);
        return (0, refund_detail_entity_1.buildRefundDetailEntity)(refund, attempts);
    }
};
exports.RefundsRestService = RefundsRestService;
exports.RefundsRestService = RefundsRestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [refunds_service_1.RefundsService,
        refund_operations_service_1.RefundOperationsService])
], RefundsRestService);
//# sourceMappingURL=refunds-rest.service.js.map