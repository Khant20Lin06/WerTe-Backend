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
exports.MessageFallbackJob = void 0;
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
let MessageFallbackJob = class MessageFallbackJob {
    constructor(queueService, logger) {
        this.queueService = queueService;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.messagingFallback, queue_constants_1.QueueJobNames.messagingFallback.pushFallback, (payload) => this.handle(payload));
    }
    async handle(payload) {
        this.logger.logEvent('Message fallback baseline job processed.', {
            conversationId: payload.conversationId,
        }, 'MessageFallbackJob');
    }
};
exports.MessageFallbackJob = MessageFallbackJob;
exports.MessageFallbackJob = MessageFallbackJob = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        app_logger_1.AppLogger])
], MessageFallbackJob);
//# sourceMappingURL=message-fallback.job.js.map