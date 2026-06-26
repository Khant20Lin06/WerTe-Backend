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
exports.PaymentProviderEventProcessingJob = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
const payment_provider_event_processor_service_1 = require("../modules/payments/services/payment-provider-event-processor.service");
let PaymentProviderEventProcessingJob = class PaymentProviderEventProcessingJob {
    constructor(queueService, paymentProviderEventProcessorService, logger) {
        this.queueService = queueService;
        this.paymentProviderEventProcessorService = paymentProviderEventProcessorService;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.processPaymentEvent, (payload) => this.handle(payload));
    }
    async handle(payload) {
        const event = await this.paymentProviderEventProcessorService.processPaymentProviderEvent({
            paymentProviderEventId: payload.paymentProviderEventId,
            retryTerminal: payload.retryTerminal === true,
        });
        this.logger.logEvent('Payment provider event processing job completed.', {
            paymentProviderEventId: event.paymentProviderEventId,
            processingStatus: event.processingStatus,
            providerEventId: event.providerEventId,
        }, 'PaymentProviderEventProcessingJob');
    }
};
exports.PaymentProviderEventProcessingJob = PaymentProviderEventProcessingJob;
exports.PaymentProviderEventProcessingJob = PaymentProviderEventProcessingJob = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        payment_provider_event_processor_service_1.PaymentProviderEventProcessorService,
        app_logger_1.AppLogger])
], PaymentProviderEventProcessingJob);
//# sourceMappingURL=payment-provider-event-processing.job.js.map