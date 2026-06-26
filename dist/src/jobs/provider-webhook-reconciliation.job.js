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
var ProviderWebhookReconciliationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWebhookReconciliationJob = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
const payments_repository_1 = require("../modules/payments/repositories/payments.repository");
const refunds_repository_1 = require("../modules/refunds/repositories/refunds.repository");
let ProviderWebhookReconciliationJob = ProviderWebhookReconciliationJob_1 = class ProviderWebhookReconciliationJob {
    constructor(queueService, paymentsRepository, refundsRepository, logger) {
        this.queueService = queueService;
        this.paymentsRepository = paymentsRepository;
        this.refundsRepository = refundsRepository;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.reconcileEvents, (payload) => this.handle(payload));
    }
    async handle(payload) {
        const limit = this.resolveLimit(payload.limit);
        const [paymentEvents, refundEvents] = await Promise.all([
            this.paymentsRepository.listProcessablePaymentProviderEvents(limit),
            this.refundsRepository.listProcessableRefundProviderEvents(limit),
        ]);
        for (const event of paymentEvents) {
            await this.queueService.add(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.processPaymentEvent, {
                paymentProviderEventId: event.id,
                retryTerminal: true,
            });
        }
        for (const event of refundEvents) {
            await this.queueService.add(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.processRefundEvent, {
                refundProviderEventId: event.id,
                retryTerminal: true,
            });
        }
        this.logger.logEvent('Provider webhook reconciliation job queued events.', {
            limit,
            paymentEventCount: paymentEvents.length,
            refundEventCount: refundEvents.length,
        }, 'ProviderWebhookReconciliationJob');
    }
    resolveLimit(limit) {
        if (limit === undefined || !Number.isFinite(limit)) {
            return ProviderWebhookReconciliationJob_1.defaultLimit;
        }
        return Math.max(1, Math.min(Math.floor(limit), 250));
    }
};
exports.ProviderWebhookReconciliationJob = ProviderWebhookReconciliationJob;
ProviderWebhookReconciliationJob.defaultLimit = 50;
exports.ProviderWebhookReconciliationJob = ProviderWebhookReconciliationJob = ProviderWebhookReconciliationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        payments_repository_1.PaymentsRepository,
        refunds_repository_1.RefundsRepository,
        app_logger_1.AppLogger])
], ProviderWebhookReconciliationJob);
//# sourceMappingURL=provider-webhook-reconciliation.job.js.map