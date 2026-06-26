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
exports.PaymentProviderEventProcessorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_json_util_1 = require("../../../common/utils/prisma-json.util");
const system_authenticated_actor_helper_1 = require("../../auth/entities/system-authenticated-actor.helper");
const provider_event_processing_policy_helper_1 = require("../../provider-webhooks/policies/provider-event-processing-policy.helper");
const payment_provider_event_entity_1 = require("../entities/payment-provider-event.entity");
const payments_repository_1 = require("../repositories/payments.repository");
const payment_lifecycle_service_1 = require("./payment-lifecycle.service");
const PAYMENT_WEBHOOK_SYSTEM_ACTOR = (0, system_authenticated_actor_helper_1.createSystemAuthenticatedActor)('payment-provider-webhook', client_1.UserRole.SUPPORT);
let PaymentProviderEventProcessorService = class PaymentProviderEventProcessorService {
    constructor(paymentsRepository, paymentLifecycleService) {
        this.paymentsRepository = paymentsRepository;
        this.paymentLifecycleService = paymentLifecycleService;
    }
    async processPaymentProviderEvent(input) {
        const event = await this.paymentsRepository.findPaymentProviderEventById(input.paymentProviderEventId);
        if (event === null) {
            throw new app_exception_1.AppException('Payment provider event was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const occurredAt = input.occurredAt ?? new Date();
        if (!(0, provider_event_processing_policy_helper_1.shouldProcessProviderEvent)({
            processingStatus: event.processingStatus,
            retryTerminal: input.retryTerminal,
        })) {
            return (0, payment_provider_event_entity_1.buildPaymentProviderEventEntity)(event);
        }
        if (!(0, provider_event_processing_policy_helper_1.isProviderEventVerifiedForProcessing)(event.verificationStatus)) {
            return this.markFailed(event, {
                failureCode: 'provider_event_not_verified',
                failureMessage: 'Payment provider event must be verified before lifecycle processing.',
                occurredAt,
            });
        }
        const lifecycleAction = this.resolveLifecycleAction(event.normalizedStatus);
        if (lifecycleAction === null) {
            return this.markIgnored(event, {
                failureCode: 'non_terminal_payment_status',
                failureMessage: 'Payment provider event does not contain a terminal payment status.',
                occurredAt,
            });
        }
        const payment = await this.resolvePayment(event);
        if (payment === null) {
            return this.markIgnored(event, {
                failureCode: 'payment_not_matched',
                failureMessage: 'Payment provider event could not be matched to an existing payment.',
                occurredAt,
            });
        }
        if (payment.provider !== event.provider) {
            return this.markFailed(event, {
                failureCode: 'payment_provider_mismatch',
                failureMessage: 'Payment provider event provider does not match the linked payment provider.',
                occurredAt,
                payment,
            });
        }
        try {
            const paymentSummary = await this.applyLifecycleAction(event, payment.id, lifecycleAction);
            return this.markProcessed(event, {
                occurredAt,
                paymentSummary,
            });
        }
        catch (error) {
            await this.markFailed(event, {
                failureCode: this.readFailureCode(error),
                failureMessage: this.readFailureMessage(error),
                occurredAt,
                payment,
            });
            throw error;
        }
    }
    resolveLifecycleAction(status) {
        switch (status) {
            case client_1.PaymentStatus.SUCCEEDED:
                return 'confirm';
            case client_1.PaymentStatus.FAILED:
                return 'fail';
            case client_1.PaymentStatus.CANCELLED:
                return 'cancel';
            case client_1.PaymentStatus.EXPIRED:
                return 'expire';
            default:
                return null;
        }
    }
    async resolvePayment(event) {
        if (event.paymentId !== null) {
            const payment = await this.paymentsRepository.findById(event.paymentId);
            if (payment !== null) {
                return payment;
            }
        }
        if (event.providerReference === null) {
            return null;
        }
        return this.paymentsRepository.findLatestByProviderReference(event.provider, event.providerReference);
    }
    applyLifecycleAction(event, paymentId, lifecycleAction) {
        const lifecycleInput = {
            paymentId,
            providerReference: event.providerReference,
            reasonCode: this.buildReasonCode(event),
            note: this.buildLifecycleNote(event),
            failureCode: lifecycleAction === 'fail'
                ? event.failureCode ?? 'provider_payment_failed'
                : null,
            failureMessage: lifecycleAction === 'fail'
                ? event.failureMessage ?? 'Provider reported payment failure.'
                : null,
            metadata: this.buildLifecycleMetadata(event),
            requestPayloadJson: this.toOptionalInputJson(event.normalizedPayloadJson),
            responsePayloadJson: this.toOptionalInputJson(event.rawPayloadJson),
        };
        const options = {
            skipAdminFinanceAccess: true,
        };
        switch (lifecycleAction) {
            case 'confirm':
                return this.paymentLifecycleService.confirmCurrentPayment(PAYMENT_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
            case 'fail':
                return this.paymentLifecycleService.failCurrentPayment(PAYMENT_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
            case 'cancel':
                return this.paymentLifecycleService.cancelCurrentPayment(PAYMENT_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
            case 'expire':
                return this.paymentLifecycleService.expireCurrentPayment(PAYMENT_WEBHOOK_SYSTEM_ACTOR, lifecycleInput, options);
        }
    }
    async markProcessed(event, input) {
        const updatedEvent = await this.paymentsRepository.updatePaymentProviderEventProcessingState({
            paymentProviderEventId: event.id,
            processingStatus: client_1.ProviderEventProcessingStatus.PROCESSED,
            paymentId: input.paymentSummary.paymentId,
            orderId: input.paymentSummary.orderId,
            providerReference: input.paymentSummary.providerReference ?? event.providerReference,
            processingMetadataJson: this.buildProcessingMetadata(event, {
                outcome: 'processed',
                paymentId: input.paymentSummary.paymentId,
                orderId: input.paymentSummary.orderId,
                paymentStatus: input.paymentSummary.status,
                orderStatus: input.paymentSummary.order.status,
                processedAt: input.occurredAt.toISOString(),
            }),
            occurredAt: input.occurredAt,
        });
        return (0, payment_provider_event_entity_1.buildPaymentProviderEventEntity)(updatedEvent);
    }
    async markIgnored(event, input) {
        const updatedEvent = await this.paymentsRepository.updatePaymentProviderEventProcessingState({
            paymentProviderEventId: event.id,
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
        return (0, payment_provider_event_entity_1.buildPaymentProviderEventEntity)(updatedEvent);
    }
    async markFailed(event, input) {
        const updatedEvent = await this.paymentsRepository.updatePaymentProviderEventProcessingState({
            paymentProviderEventId: event.id,
            processingStatus: client_1.ProviderEventProcessingStatus.FAILED,
            paymentId: input.payment?.id,
            orderId: input.payment?.orderId,
            providerReference: input.payment?.providerReference ?? event.providerReference,
            processingMetadataJson: this.buildProcessingMetadata(event, {
                outcome: 'failed',
                failureCode: input.failureCode,
                failureMessage: input.failureMessage,
                failedAt: input.occurredAt.toISOString(),
                paymentId: input.payment?.id ?? event.paymentId,
                orderId: input.payment?.orderId ?? event.orderId,
            }),
            failureCode: input.failureCode,
            failureMessage: input.failureMessage,
            occurredAt: input.occurredAt,
        });
        return (0, payment_provider_event_entity_1.buildPaymentProviderEventEntity)(updatedEvent);
    }
    buildLifecycleMetadata(event) {
        return {
            providerWebhook: true,
            paymentProviderEventId: event.id,
            providerEventId: event.providerEventId,
            eventType: event.eventType,
            provider: event.provider,
            normalizedStatus: event.normalizedStatus,
            receivedAt: event.receivedAt.toISOString(),
        };
    }
    buildProcessingMetadata(event, nextMetadata) {
        return {
            ...((0, prisma_json_util_1.asJsonObject)(event.processingMetadataJson) ?? {}),
            processor: 'payment_webhook_lifecycle',
            provider: event.provider,
            providerEventId: event.providerEventId,
            eventType: event.eventType,
            normalizedStatus: event.normalizedStatus,
            ...nextMetadata,
        };
    }
    buildReasonCode(event) {
        switch (event.normalizedStatus) {
            case client_1.PaymentStatus.SUCCEEDED:
                return 'provider_payment_succeeded';
            case client_1.PaymentStatus.FAILED:
                return event.failureCode ?? 'provider_payment_failed';
            case client_1.PaymentStatus.CANCELLED:
                return 'provider_payment_cancelled';
            case client_1.PaymentStatus.EXPIRED:
                return 'provider_payment_expired';
            default:
                return 'provider_payment_event';
        }
    }
    buildLifecycleNote(event) {
        switch (event.normalizedStatus) {
            case client_1.PaymentStatus.FAILED:
                return event.failureMessage ?? 'Provider reported payment failure.';
            case client_1.PaymentStatus.CANCELLED:
                return 'Provider reported payment cancellation.';
            case client_1.PaymentStatus.EXPIRED:
                return 'Provider reported payment expiration.';
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
        return 'payment_webhook_processing_failed';
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
        return 'Payment provider event could not be processed.';
    }
};
exports.PaymentProviderEventProcessorService = PaymentProviderEventProcessorService;
exports.PaymentProviderEventProcessorService = PaymentProviderEventProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository,
        payment_lifecycle_service_1.PaymentLifecycleService])
], PaymentProviderEventProcessorService);
//# sourceMappingURL=payment-provider-event-processor.service.js.map