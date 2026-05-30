"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDeliveryService = void 0;
const common_1 = require("@nestjs/common");
let MessageDeliveryService = class MessageDeliveryService {
    constructor() {
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
    async queuePushFallback(_conversationId) {
        return;
    }
};
exports.MessageDeliveryService = MessageDeliveryService;
exports.MessageDeliveryService = MessageDeliveryService = __decorate([
    (0, common_1.Injectable)()
], MessageDeliveryService);
//# sourceMappingURL=message-delivery.service.js.map