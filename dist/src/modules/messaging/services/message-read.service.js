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
exports.MessageReadService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const conversation_message_list_entity_1 = require("../entities/conversation-message-list.entity");
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
const message_policy_service_1 = require("./message-policy.service");
let MessageReadService = class MessageReadService {
    constructor(conversationRepository, messageRepository, messagingPolicyService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messagingPolicyService = messagingPolicyService;
    }
    async listCurrentUserConversationMessages(currentUser, input) {
        const conversation = await this.conversationRepository.findResolvedById(input.conversationId);
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
        const participant = this.messagingPolicyService.findActiveParticipant(currentUser, conversation);
        if (participant === null) {
            throw new app_exception_1.AppException('The authenticated actor is not an active participant in the conversation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const page = await this.messageRepository.listConversationMessages(input.conversationId, {
            cursor: input.cursor,
            limit: input.limit,
        });
        return (0, conversation_message_list_entity_1.buildConversationMessageList)(input.conversationId, page.records.map((record) => (0, conversation_message_list_entity_1.buildConversationMessage)(record, {
            currentUserId: currentUser.userId,
            viewerRole: participant.roleAtJoin,
        })), page.nextCursor, page.hasMore);
    }
};
exports.MessageReadService = MessageReadService;
exports.MessageReadService = MessageReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_repository_1.ConversationRepository,
        message_repository_1.MessageRepository,
        message_policy_service_1.MessagingPolicyService])
], MessageReadService);
//# sourceMappingURL=message-read.service.js.map