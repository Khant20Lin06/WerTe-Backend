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
exports.MessageReceiptService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
const message_delivery_service_1 = require("./message-delivery.service");
const message_policy_service_1 = require("./message-policy.service");
let MessageReceiptService = class MessageReceiptService {
    constructor(conversationRepository, messageRepository, messagingPolicyService, messageDeliveryService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messagingPolicyService = messagingPolicyService;
        this.messageDeliveryService = messageDeliveryService;
    }
    async markMessageRead(currentUser, messageId) {
        const context = await this.messageRepository.findMessageReadContextById(messageId);
        if (context === null) {
            throw new app_exception_1.AppException('Message was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const conversation = await this.conversationRepository.findResolvedById(context.conversationId);
        if (conversation === null) {
            throw new app_exception_1.AppException('Conversation was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.messagingPolicyService.canAccessConversation(currentUser, conversation)) {
            throw new app_exception_1.AppException('You are not allowed to access this conversation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        if (this.messagingPolicyService.findActiveParticipant(currentUser, conversation) === null) {
            throw new app_exception_1.AppException('The authenticated actor is not an active participant in the conversation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const receipt = await this.messageRepository.markConversationReadUpTo({
            conversationId: context.conversationId,
            targetMessageId: context.id,
            userId: currentUser.userId,
        });
        this.messageDeliveryService.emitMessageRead(receipt);
        this.messageDeliveryService.emitConversationUpdated(context.conversationId);
        return receipt;
    }
};
exports.MessageReceiptService = MessageReceiptService;
exports.MessageReceiptService = MessageReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_repository_1.ConversationRepository,
        message_repository_1.MessageRepository,
        message_policy_service_1.MessagingPolicyService,
        message_delivery_service_1.MessageDeliveryService])
], MessageReceiptService);
//# sourceMappingURL=message-receipt.service.js.map