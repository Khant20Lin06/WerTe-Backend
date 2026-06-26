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
exports.ConversationReadService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const conversation_summary_entity_1 = require("../entities/conversation-summary.entity");
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
const message_policy_service_1 = require("./message-policy.service");
let ConversationReadService = class ConversationReadService {
    constructor(conversationRepository, messageRepository, messagingPolicyService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messagingPolicyService = messagingPolicyService;
    }
    async listCurrentUserConversations(currentUser, limit = 20, orderId) {
        const records = await this.conversationRepository.listConversationSummaryRecordsForUser(currentUser.userId, limit, orderId);
        const unreadCounts = await this.messageRepository.countUnreadByConversationIds(currentUser.userId, records.map((record) => record.id));
        return records.map((record) => (0, conversation_summary_entity_1.buildConversationSummary)(record, currentUser.userId, unreadCounts[record.id] ?? 0));
    }
    async listCurrentUserOrderConversations(currentUser, orderId, limit = 20) {
        return this.listCurrentUserConversations(currentUser, limit, orderId);
    }
    async getCurrentUserConversation(currentUser, conversationId) {
        const record = await this.conversationRepository.findConversationSummaryRecordById(conversationId);
        if (record === null) {
            throw new app_exception_1.AppException('Conversation was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        const conversation = await this.conversationRepository.findResolvedById(conversationId);
        if (conversation === null ||
            !this.messagingPolicyService.canAccessConversation(currentUser, conversation)) {
            throw new app_exception_1.AppException('You are not allowed to access this conversation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const unreadCounts = await this.messageRepository.countUnreadByConversationIds(currentUser.userId, [conversationId]);
        return (0, conversation_summary_entity_1.buildConversationSummary)(record, currentUser.userId, unreadCounts[conversationId] ?? 0);
    }
};
exports.ConversationReadService = ConversationReadService;
exports.ConversationReadService = ConversationReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_repository_1.ConversationRepository,
        message_repository_1.MessageRepository,
        message_policy_service_1.MessagingPolicyService])
], ConversationReadService);
//# sourceMappingURL=conversation-read.service.js.map