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
exports.RefundProviderEventProcessingJob = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
const refund_provider_event_processor_service_1 = require("../modules/refunds/services/refund-provider-event-processor.service");
let RefundProviderEventProcessingJob = class RefundProviderEventProcessingJob {
    constructor(queueService, refundProviderEventProcessorService, logger) {
        this.queueService = queueService;
        this.refundProviderEventProcessorService = refundProviderEventProcessorService;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.providerWebhooks, queue_constants_1.QueueJobNames.providerWebhooks.processRefundEvent, (payload) => this.handle(payload));
    }
    async handle(payload) {
        const event = await this.refundProviderEventProcessorService.processRefundProviderEvent({
            refundProviderEventId: payload.refundProviderEventId,
            retryTerminal: payload.retryTerminal === true,
        });
        this.logger.logEvent('Refund provider event processing job completed.', {
            processingStatus: event.processingStatus,
            providerEventId: event.providerEventId,
            refundProviderEventId: event.refundProviderEventId,
        }, 'RefundProviderEventProcessingJob');
    }
};
exports.RefundProviderEventProcessingJob = RefundProviderEventProcessingJob;
exports.RefundProviderEventProcessingJob = RefundProviderEventProcessingJob = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        refund_provider_event_processor_service_1.RefundProviderEventProcessorService,
        app_logger_1.AppLogger])
], RefundProviderEventProcessingJob);
//# sourceMappingURL=refund-provider-event-processing.job.js.map