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
exports.RefundProviderEventProcessorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const system_authenticated_actor_helper_1 = require("../../auth/entities/system-authenticated-actor.helper");
const provider_event_processing_policy_helper_1 = require("../../provider-webhooks/policies/provider-event-processing-policy.helper");
const refund_provider_event_entity_1 = require("../entities/refund-provider-event.entity");
const refunds_repository_1 = require("../repositories/refunds.repository");
const refund_operations_service_1 = require("./refund-operations.service");
const REFUND_WEBHOOK_SYSTEM_ACTOR = (0, system_authenticated_actor_helper_1.createSystemAuthenticatedActor)('refund-provider-webhook', client_1.UserRole.SUPPORT);
let RefundProviderEventProcessorService = class RefundProviderEventProcessorService {
    constructor(refundsRepository, refundOperationsService) {
        this.refundsRepository = refundsRepository;
        this.refundOperationsService = refundOperationsService;
    }
    async processRefundProviderEvent(input) {
        const event = await this.refundsRepository.findRefundProviderEventById(input.refundProviderEventId);
        if (event === null) {
            throw new app_exception_1.AppException('Refund provider event was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const occurredAt = input.occurredAt ?? new Date();
        if (!(0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: event.processingStatus,
            retryTerminal: input.retryTerminal,
        })) {
            return (0, refund_provider_event_entity_1.buildRefundProviderEventEntity)(event);
        }
        if (!(0, provider_event_processing_policy_helper_1.isProviderEventVerifiedForProcessing)(event.verificationStatus)) {
            return this.markFailed(event, {
                failureCode: 'provider_event_not_verified',
                failureMessage: 'Refund provider event must be verified before lifecycle processing.',
                occurredAt,
            });
        }
        const lifecycleAction = this.resolveLifecycleAction(event.normalizedStatus);
        if (lifecycleAction === null) {
            return this.markIgnored(event, {
                failureCode: 'non_terminal_refund_status',
                failureMessage: 'Refund provider event does not contain a terminal refund status.',
                occurredAt,
            });
        }
        const refund = await this.resolveRefund(event);
        if (refund === null) {
            return this.markIgnored(event, {
                failureCode: 'refund_not_matched',
                failureMessage: 'Refund provider event could not be matched to an existing refund.',
                occurredAt,
            });
        }
        if (refund.payment.provider !== event.provider) {
            return this.markFailed(event, {
                failureCode: 'refund_provider_mismatch',
                failureMessage: 'Refund provider event provider does not match the linked payment provider.',
                occurredAt,
                refund,
            });
        }
        try {
            const refundSummary = await this.applyLifecycleAction(event, refund.id, lifecycleAction);
            return this.markProcessed(event, {
                occurredAt,
                refundSummary,
            });
        }
        catch (error) {
            await this.markFailed(event, {
                failureCode: this.readFailureCode(error),
                failureMessage: this.readFailureMessage(error),
                occurredAt,
                refund,
            });
            throw error;
        }
    }
    resolveLifecycleAction(status) {
        switch (status) {
            case client_1.RefundStatus.SUCCEEDED:
                return 'succeed';
            case client_1.RefundStatus.FAILED:
                return 'fail';
            case client_1.RefundStatus.CANCELLED:
                return 'cancel';
            default:
                return null;
        }
    }
    async resolveRefund(event) {
        if (event.refundId !== null) {
            const refund = await this.refundsRepository.findById(event.refundId);
            if (refund !== null) {
                return refund;
            }
        }
        if (event.providerReference === null) {
            return null;
        }
        return this.refundsRepository.findLatestByProviderReference(event.provider, event.providerReference);
    }
    applyLifecycleAction(event, refundId, lifecycleAction) {
        const lifecycleInput = {
            refundId,
            providerReference: event.providerReference,
            reasonCode: this.buildReasonCode(event),
            note: this.buildLifecycleNote(event),
            failureCode: lifecycleAction === 'fail'
                ? event.failureCode ?? 'provider_refund_failed'
                : null,
            failureMessage: lifecycleAction === 'fail'
                ? event.failureMessage ?? 'Provider reported refund failure.'
                : null,
            metadata: this.buildLifecycleMetadata(event),
            requestPayloadJson: this.toOptionalInputJson(event.normalizedPayloadJson),
            responsePayloadJson: this.toOptionalInputJson(event.rawPayloadJson),
        };
        const options = {
            skipAdminFinanceAccess: true,
        };
        switch (lifecycleAction) {
            case 'succeed':
                return this.refundOperationsService.succeedCurrentAdminRefund(REFUND_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
            case 'fail':
                return this.refundOperationsService.failCurrentAdminRefund(REFUND_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
            case 'cancel':
                return this.refundOperationsService.cancelCurrentAdminRefund(REFUND_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
        }
    }
    async markProcessed(event, input) {
        const updatedEvent = await this.refundsRepository.updateRefundProviderEventProcessingState({
            refundProviderEventId: event.id,
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            refundId: input.refundSummary.refundId,
            paymentId: input.refundSummary.paymentId,
            orderId: input.refundSummary.orderId,
            providerReference: input.refundSummary.providerReference ?? event.providerReference,
            processingMetadataJson: this.buildProcessingMetadata(event, {
                outcome: 'processed',
                refundId: input.refundSummary.refundId,
                paymentId: input.refundSummary.paymentId,
                orderId: input.refundSummary.orderId,
                refundStatus: input.refundSummary.status,
                paymentStatus: input.refundSummary.payment.status,
                orderStatus: input.refundSummary.order.status,
                processedAt: input.occurredAt.toISOString(),
            }),
            occurredAt: input.occurredAt,
        });
        return (0, refund_provider_event_entity_1.buildRefundProviderEventEntity)(updatedEvent);
    }
    async markIgnored(event, input) {
        const updatedEvent = await this.refundsRepository.updateRefundProviderEventProcessingState({
            refundProviderEventId: event.id,
            processingStatus: client_1.ProviderEventProcessingStatus.IGNORED,
            processingMetadataJson: this.buildProcessingMetadata(event, {
                outcome: 'ignored',
                failureCode: input.failureCode,
                failureMessage: input.failureMessage,
                ignoredAt: input.occurredAt.toISOString(),
            }),
            failureCode: input.failureCode,
            failureMessage: input.failureMessage,
            occurredAt: input.occurredAt,
        });
        return (0, refund_provider_event_entity_1.buildRefundProviderEventEntity)(updatedEvent);
    }
    async markFailed(event, input) {
        const updatedEvent = await this.refundsRepository.updateRefundProviderEventProcessingState({
            refundProviderEventId: event.id,
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            refundId: input.refund?.id,
            paymentId: input.refund?.paymentId,
            orderId: input.refund?.orderId,
            providerReference: input.refund?.providerReference ?? event.providerReference,
            processingMetadataJson: this.buildProcessingMetadata(event, {
                outcome: 'failed',
                failureCode: input.failureCode,
                failureMessage: input.failureMessage,
                failedAt: input.occurredAt.toISOString(),
                refundId: input.refund?.id ?? event.refundId,
                paymentId: input.refund?.paymentId ?? event.paymentId,
                orderId: input.refund?.orderId ?? event.orderId,
            }),
            failureCode: input.failureCode,
            failureMessage: input.failureMessage,
            occurredAt: input.occurredAt,
        });
        return (0, refund_provider_event_entity_1.buildRefundProviderEventEntity)(updatedEvent);
    }
    buildLifecycleMetadata(event) {
        return {
            providerWebhook: true,
            refundProviderEventId: event.id,
            providerEventId: event.providerEventId,
            eventType: event.eventType,
            provider: event.provider,
            normalizedStatus: event.normalizedStatus,
            receivedAt: event.receivedAt.toISOString(),
        };
    }
    buildProcessingMetadata(event, nextMetadata) {
        return {
            ...(this.asJsonObject(event.processingMetadataJson) ?? {}),
            processor: 'refund_webhook_lifecycle',
            provider: event.provider,
            providerEventId: event.providerEventId,
            eventType: event.eventType,
            normalizedStatus: event.normalizedStatus,
            ...nextMetadata,
        };
    }
    buildReasonCode(event) {
        switch (event.normalizedStatus) {
            case client_1.RefundStatus.SUCCEEDED:
                return 'provider_refund_succeeded';
            case client_1.RefundStatus.FAILED:
                return event.failureCode ?? 'provider_refund_failed';
            case client_1.RefundStatus.CANCELLED:
                return 'provider_refund_cancelled';
            default:
                return 'provider_refund_event';
        }
    }
    buildLifecycleNote(event) {
        switch (event.normalizedStatus) {
            case client_1.RefundStatus.FAILED:
                return event.failureMessage ?? 'Provider reported refund failure.';
            case client_1.RefundStatus.CANCELLED:
                return 'Provider reported refund cancellation.';
            default:
                return null;
        }
    }
    toOptionalInputJson(value) {
        if (value === null) {
            return undefined;
        }
        return value;
    }
    readFailureCode(error) {
        if (error instanceof common_1.HttpException) {
            const response = error.getResponse();
            if (response !== null &&
                typeof response === 'object' &&
                'code' in response &&
                typeof response.code === 'string') {
                return response.code;
            }
        }
        return 'refund_webhook_processing_failed';
    }
    readFailureMessage(error) {
        if (error instanceof common_1.HttpException) {
            const response = error.getResponse();
            if (response !== null &&
                typeof response === 'object' &&
                'message' in response &&
                typeof response.message === 'string') {
                return response.message;
            }
        }
        if (error instanceof Error && error.message.trim() !== '') {
            return error.message;
        }
        return 'Refund provider event could not be processed.';
    }
    asJsonObject(value) {
        if (value == null || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        return value;
    }
};
exports.RefundProviderEventProcessorService = RefundProviderEventProcessorService;
exports.RefundProviderEventProcessorService = RefundProviderEventProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [refunds_repository_1.RefundsRepository,
        refund_operations_service_1.RefundOperationsService])
], RefundProviderEventProcessorService);
//# sourceMappingURL=refund-provider-event-processor.service.js.map