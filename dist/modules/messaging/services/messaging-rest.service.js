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
exports.MessagingRestService = void 0;
const common_1 = require("@nestjs/common");
const conversation_read_service_1 = require("./conversation-read.service");
const conversation_service_1 = require("./conversation.service");
const message_read_service_1 = require("./message-read.service");
const message_receipt_service_1 = require("./message-receipt.service");
const message_service_1 = require("./message.service");
let MessagingRestService = class MessagingRestService {
    constructor(conversationService, conversationReadService, messageReadService, messageService, messageReceiptService) {
        this.conversationService = conversationService;
        this.conversationReadService = conversationReadService;
        this.messageReadService = messageReadService;
        this.messageService = messageService;
        this.messageReceiptService = messageReceiptService;
    }
    listCurrentUserConversations(currentUser, query) {
        return this.conversationReadService.listCurrentUserConversations(currentUser, query.limit);
    }
    listCurrentUserOrderConversations(currentUser, orderId, query) {
        return this.conversationReadService.listCurrentUserOrderConversations(currentUser, orderId, query.limit);
    }
    resolveCurrentUserConversationForOrder(currentUser, orderId, body) {
        return this.conversationService.resolve(currentUser, {
            orderId,
            type: body.type,
        });
    }
    getCurrentUserConversation(currentUser, conversationId) {
        return this.conversationReadService.getCurrentUserConversation(currentUser, conversationId);
    }
    listCurrentUserConversationMessages(currentUser, conversationId, query) {
        return this.messageReadService.listCurrentUserConversationMessages(currentUser, {
            conversationId,
            cursor: query.cursor,
            limit: query.limit,
        });
    }
    sendCurrentUserMessage(currentUser, conversationId, body) {
        return this.messageService.send(currentUser, {
            conversationId,
            type: body.type,
            body: body.body,
            attachments: body.attachments,
        });
    }
    async markCurrentUserMessageRead(currentUser, messageId) {
        return this.messageReceiptService.markMessageRead(currentUser, messageId);
    }
};
exports.MessagingRestService = MessagingRestService;
exports.MessagingRestService = MessagingRestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService,
        conversation_read_service_1.ConversationReadService,
        message_read_service_1.MessageReadService,
        message_service_1.MessageService,
        message_receipt_service_1.MessageReceiptService])
], MessagingRestService);
//# sourceMappingURL=messaging-rest.service.js.map