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
exports.RefundOperationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const system_message_service_1 = require("../../messaging/services/system-message.service");
const finance_access_policy_helper_1 = require("../../payments/policies/finance-access-policy.helper");
const payments_repository_1 = require("../../payments/repositories/payments.repository");
const refund_summary_entity_1 = require("../entities/refund-summary.entity");
const refunds_repository_1 = require("../repositories/refunds.repository");
const REFUNDABLE_PAYMENT_STATUSES = new Set([
    client_1.PaymentStatus.SUCCEEDED,
    client_1.PaymentStatus.PARTIALLY_REFUNDED,
]);
const FINALIZABLE_REFUND_STATUSES = new Set([
    client_1.RefundStatus.PENDING,
    client_1.RefundStatus.PROCESSING,
]);
const RESERVED_REFUND_STATUSES = new Set([
    client_1.RefundStatus.PENDING,
    client_1.RefundStatus.PROCESSING,
    client_1.RefundStatus.SUCCEEDED,
]);
let RefundOperationsService = class RefundOperationsService {
    constructor(prisma, paymentsRepository, refundsRepository, systemMessageService) {
        this.prisma = prisma;
        this.paymentsRepository = paymentsRepository;
        this.refundsRepository = refundsRepository;
        this.systemMessageService = systemMessageService;
    }
    async requestCurrentAdminRefund(currentUser, input) {
        this.requireAdmin(currentUser);
        if (input.idempotencyKey !== undefined && input.idempotencyKey !== null) {
            const existingRefund = await this.refundsRepository.findByIdempotencyKey(input.idempotencyKey);
            if (existingRefund !== null) {
                if (existingRefund.paymentId !== input.paymentId) {
                    throw new app_exception_1.AppException('This refund idempotency key is already linked to another payment.', common_1.HttpStatus.CONFLICT, {
                        code: error_codes_1.ErrorCodes.conflict,
                    });
                }
                return (0, refund_summary_entity_1.buildRefundSummaryEntity)(existingRefund);
            }
        }
        const payment = await this.paymentsRepository.findById(input.paymentId);
        if (payment === null) {
            throw new app_exception_1.AppException('Payment was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!REFUNDABLE_PAYMENT_STATUSES.has(payment.status)) {
            throw new app_exception_1.AppException('Refunds can only be requested for completed payments.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const requestedAmount = this.parsePositiveAmount(input.amount);
        const availableAmount = this.computeAvailableRefundableAmount(payment);
        if (requestedAmount.greaterThan(availableAmount)) {
            throw new app_exception_1.AppException('The requested refund amount exceeds the refundable balance.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        const occurredAt = new Date();
        const refund = await this.prisma.runInTransaction(async (tx) => {
            return this.refundsRepository.createRefundRequest({
                paymentId: payment.id,
                orderId: payment.orderId,
                createdByUserId: currentUser.userId,
                status: client_1.RefundStatus.PENDING,
                amount: requestedAmount,
                currencyCode: payment.currencyCode,
                idempotencyKey: input.idempotencyKey ?? null,
                providerReference: input.providerReference ?? null,
                reasonCode: input.reasonCode ?? 'admin_requested_refund',
                note: input.note ?? null,
                metadataJson: this.buildMergedMetadata(payment.metadataJson, input.metadata, {
                    actorUserId: currentUser.userId,
                    targetStatus: client_1.RefundStatus.PENDING,
                    reasonCode: input.reasonCode ?? 'admin_requested_refund',
                    note: input.note ?? null,
                    occurredAt,
                }),
                provider: payment.provider,
                requestPayloadJson: input.requestPayloadJson,
                responsePayloadJson: input.responsePayloadJson,
                occurredAt,
            }, tx);
        });
        const refundEntity = (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund);
        await this.publishRefundEvent(currentUser, {
            refund: refundEntity,
            code: client_1.SystemMessageCode.REFUND_REQUESTED,
            reasonCode: input.reasonCode ?? 'admin_requested_refund',
            note: input.note ?? null,
            metadata: {
                refundId: refundEntity.refundId,
                paymentId: refundEntity.paymentId,
                refundStatus: refundEntity.status,
                refundAmount: refundEntity.amount,
                currencyCode: refundEntity.currencyCode,
            },
        });
        return refundEntity;
    }
    async succeedCurrentAdminRefund(currentUser, input, options) {
        this.requireAdmin(currentUser, options);
        return this.finalizeRefund(currentUser, input, {
            targetStatus: client_1.RefundStatus.SUCCEEDED,
            systemMessageCode: client_1.SystemMessageCode.REFUND_SUCCEEDED,
            conflictMessage: 'This refund can no longer be marked as succeeded.',
            defaultReasonCode: 'refund_succeeded',
        });
    }
    async failCurrentAdminRefund(currentUser, input, options) {
        this.requireAdmin(currentUser, options);
        return this.finalizeRefund(currentUser, input, {
            targetStatus: client_1.RefundStatus.FAILED,
            systemMessageCode: client_1.SystemMessageCode.REFUND_FAILED,
            conflictMessage: 'This refund can no longer be marked as failed.',
            defaultReasonCode: 'refund_failed',
        });
    }
    async cancelCurrentAdminRefund(currentUser, input, options) {
        this.requireAdmin(currentUser, options);
        return this.finalizeRefund(currentUser, input, {
            targetStatus: client_1.RefundStatus.CANCELLED,
            systemMessageCode: null,
            conflictMessage: 'This refund can no longer be cancelled.',
            defaultReasonCode: 'refund_cancelled',
        });
    }
    async finalizeRefund(currentUser, input, config) {
        const currentRefund = await this.refundsRepository.findById(input.refundId);
        if (currentRefund === null) {
            throw new app_exception_1.AppException('Refund was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (currentRefund.status === config.targetStatus) {
            return (0, refund_summary_entity_1.buildRefundSummaryEntity)(currentRefund);
        }
        if (!FINALIZABLE_REFUND_STATUSES.has(currentRefund.status)) {
            throw new app_exception_1.AppException(config.conflictMessage, common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
            });
        }
        const occurredAt = new Date();
        const refund = await this.prisma.runInTransaction(async (tx) => {
            const transitionedRefund = await this.refundsRepository.transitionRefundStatus({
                refundId: currentRefund.id,
                provider: currentRefund.payment.provider,
                status: config.targetStatus,
                metadataJson: this.buildMergedMetadata(currentRefund.metadataJson, input.metadata, {
                    actorUserId: currentUser.userId,
                    targetStatus: config.targetStatus,
                    reasonCode: input.reasonCode ?? config.defaultReasonCode,
                    note: input.note ?? input.failureMessage ?? null,
                    occurredAt,
                }),
                providerReference: input.providerReference ?? currentRefund.providerReference ?? null,
                failureCode: input.failureCode ?? null,
                failureMessage: input.failureMessage ?? null,
                requestPayloadJson: input.requestPayloadJson,
                responsePayloadJson: input.responsePayloadJson,
                occurredAt,
            }, tx);
            if (config.targetStatus === client_1.RefundStatus.SUCCEEDED) {
                const payment = await this.paymentsRepository.findById(transitionedRefund.paymentId, tx);
                const refundedAmount = this.computeSucceededRefundAmount(payment);
                const paymentStatus = refundedAmount.greaterThanOrEqualTo(payment.amount)
                    ? client_1.PaymentStatus.REFUNDED
                    : client_1.PaymentStatus.PARTIALLY_REFUNDED;
                await this.paymentsRepository.updateRefundState({
                    paymentId: transitionedRefund.paymentId,
                    refundedAmount,
                    status: paymentStatus,
                }, tx);
            }
            return this.refundsRepository.findById(currentRefund.id, tx);
        });
        const refundEntity = (0, refund_summary_entity_1.buildRefundSummaryEntity)(refund);
        if (config.systemMessageCode === null) {
            return refundEntity;
        }
        await this.publishRefundEvent(currentUser, {
            refund: refundEntity,
            code: config.systemMessageCode,
            reasonCode: input.reasonCode ?? config.defaultReasonCode,
            note: input.note ?? input.failureMessage ?? null,
            metadata: {
                refundId: refundEntity.refundId,
                paymentId: refundEntity.paymentId,
                refundStatus: refundEntity.status,
                refundAmount: refundEntity.amount,
                currencyCode: refundEntity.currencyCode,
                failureCode: input.failureCode ?? refundEntity.failureCode,
                failureMessage: input.failureMessage ?? refundEntity.failureMessage,
            },
        });
        return refundEntity;
    }
    async publishRefundEvent(currentUser, input) {
        await this.systemMessageService.publishOrderEvent(currentUser, {
            orderId: input.refund.orderId,
            code: input.code,
            metadata: input.metadata,
            templateVariables: {
                reasonCode: input.reasonCode,
                note: input.note,
            },
        });
    }
    computeAvailableRefundableAmount(payment) {
        const reservedAmount = payment.refunds.reduce((total, refund) => {
            if (!RESERVED_REFUND_STATUSES.has(refund.status)) {
                return total;
            }
            return total.add(refund.amount);
        }, new client_1.Prisma.Decimal(0));
        const availableAmount = payment.amount.sub(reservedAmount);
        return availableAmount.lessThan(0) ? new client_1.Prisma.Decimal(0) : availableAmount;
    }
    computeSucceededRefundAmount(payment) {
        return payment.refunds.reduce((total, refund) => {
            if (refund.status !== client_1.RefundStatus.SUCCEEDED) {
                return total;
            }
            return total.add(refund.amount);
        }, new client_1.Prisma.Decimal(0));
    }
    parsePositiveAmount(value) {
        let amount;
        try {
            amount = new client_1.Prisma.Decimal(value);
        }
        catch {
            throw new app_exception_1.AppException('Refund amount is invalid.', common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.badRequest,
            });
        }
        if (amount.lessThanOrEqualTo(0)) {
            throw new app_exception_1.AppException('Refund amount must be greater than zero.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        return amount;
    }
    requireAdmin(currentUser, options = {}) {
        if (options.skipAdminFinanceAccess === true) {
            return;
        }
        (0, finance_access_policy_helper_1.requireAdminFinanceAccess)(currentUser, 'refunds');
    }
    buildMergedMetadata(existingMetadata, nextMetadata, lifecycleEvent) {
        return {
            ...(this.asJsonObject(existingMetadata) ?? {}),
            ...(this.asJsonObject(nextMetadata) ?? {}),
            lastLifecycleEvent: {
                actorUserId: lifecycleEvent.actorUserId,
                targetStatus: lifecycleEvent.targetStatus,
                reasonCode: lifecycleEvent.reasonCode,
                note: lifecycleEvent.note,
                occurredAt: lifecycleEvent.occurredAt.toISOString(),
            },
        };
    }
    asJsonObject(value) {
        if (value == null || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        return value;
    }
};
exports.RefundOperationsService = RefundOperationsService;
exports.RefundOperationsService = RefundOperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_repository_1.PaymentsRepository,
        refunds_repository_1.RefundsRepository,
        system_message_service_1.SystemMessageService])
], RefundOperationsService);
//# sourceMappingURL=refund-operations.service.js.map