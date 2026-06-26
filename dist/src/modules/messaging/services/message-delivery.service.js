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
exports.MessageDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
let MessageDeliveryService = class MessageDeliveryService {
    constructor(queueService) {
        this.queueService = queueService;
        this.server = null;
    }
    attachServer(server) {
        this.server = server;
    }
    emitMessageCreated(message) {
        this.server?.to(message.conversationId).emit('message.created', message);
    }
    emitMessageRead(payload) {
        this.server?.to(payload.conversationId).emit('message.read', payload);
    }
    emitConversationUpdated(conversationId) {
        this.server?.to(conversationId).emit('conversation.updated', {
            conversationId,
        });
    }
    async queuePushFallback(conversationId) {
        await this.queueService.add(queue_constants_1.QueueNames.messagingFallback, queue_constants_1.QueueJobNames.messagingFallback.pushFallback, {
            conversationId,
        });
    }
};
exports.MessageDeliveryService = MessageDeliveryService;
exports.MessageDeliveryService = MessageDeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], MessageDeliveryService);
//# sourceMappingURL=message-delivery.service.js.map