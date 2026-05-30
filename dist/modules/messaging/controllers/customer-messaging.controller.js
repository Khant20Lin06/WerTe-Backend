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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerMessagingController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const conversation_message_list_entity_1 = require("../entities/conversation-message-list.entity");
const conversation_summary_entity_1 = require("../entities/conversation-summary.entity");
const resolved_conversation_entity_1 = require("../entities/resolved-conversation.entity");
const sent_message_entity_1 = require("../entities/sent-message.entity");
const list_conversation_messages_query_dto_1 = require("../dto/list-conversation-messages-query.dto");
const list_conversations_query_dto_1 = require("../dto/list-conversations-query.dto");
const mark_read_dto_1 = require("../dto/mark-read.dto");
const resolve_conversation_dto_1 = require("../dto/resolve-conversation.dto");
const send_conversation_message_dto_1 = require("../dto/send-conversation-message.dto");
const messaging_rest_service_1 = require("../services/messaging-rest.service");
let CustomerMessagingController = class CustomerMessagingController {
    constructor(messagingRestService) {
        this.messagingRestService = messagingRestService;
    }
    listConversations(currentUser, query) {
        return this.messagingRestService.listCurrentUserConversations(currentUser, query);
    }
    listOrderConversations(currentUser, orderId, query) {
        return this.messagingRestService.listCurrentUserOrderConversations(currentUser, orderId, query);
    }
    resolveConversation(currentUser, orderId, body) {
        return this.messagingRestService.resolveCurrentUserConversationForOrder(currentUser, orderId, body);
    }
    getConversation(currentUser, conversationId) {
        return this.messagingRestService.getCurrentUserConversation(currentUser, conversationId);
    }
    listMessages(currentUser, conversationId, query) {
        return this.messagingRestService.listCurrentUserConversationMessages(currentUser, conversationId, query);
    }
    sendMessage(currentUser, conversationId, body) {
        return this.messagingRestService.sendCurrentUserMessage(currentUser, conversationId, body);
    }
    markRead(currentUser, messageId) {
        return this.messagingRestService.markCurrentUserMessageRead(currentUser, messageId);
    }
};
exports.CustomerMessagingController = CustomerMessagingController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCurrentCustomerConversations',
        summary: 'List conversations visible to the authenticated customer',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns current customer conversation summaries.',
        type: conversation_summary_entity_1.ConversationSummaryEntity,
        isArray: true,
    }),
    (0, common_1.Get)('conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_conversations_query_dto_1.ListConversationsQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerMessagingController.prototype, "listConversations", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCurrentCustomerOrderConversations',
        summary: 'List order conversations visible to the authenticated customer',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the current customer conversation summaries for the order.',
        type: conversation_summary_entity_1.ConversationSummaryEntity,
        isArray: true,
    }),
    (0, common_1.Get)('orders/:orderId/conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, list_conversations_query_dto_1.ListConversationsQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerMessagingController.prototype, "listOrderConversations", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'resolveCurrentCustomerConversation',
        summary: 'Resolve an order-scoped conversation for the authenticated customer',
    }),
    (0, swagger_1.ApiParam)({
        name: 'orderId',
        description: 'Order identifier visible to the authenticated customer.',
        example: 'order_1',
    }),
    (0, swagger_1.ApiBody)({ type: resolve_conversation_dto_1.ResolveConversationDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Resolves and syncs an order-scoped conversation lane for the customer.',
        type: resolved_conversation_entity_1.ResolvedConversationEntity,
    }),
    (0, common_1.Post)('orders/:orderId/conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, resolve_conversation_dto_1.ResolveConversationDto]),
    __metadata("design:returntype", void 0)
], CustomerMessagingController.prototype, "resolveConversation", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCurrentCustomerConversation',
        summary: 'Get a customer-visible conversation summary',
    }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        description: 'Conversation identifier visible to the authenticated customer.',
        example: 'con_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the requested customer-visible conversation summary.',
        type: conversation_summary_entity_1.ConversationSummaryEntity,
    }),
    (0, common_1.Get)('conversations/:conversationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], CustomerMessagingController.prototype, "getConversation", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCurrentCustomerConversationMessages',
        summary: 'List messages visible to the authenticated customer in a conversation',
    }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        description: 'Conversation identifier visible to the authenticated customer.',
        example: 'con_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a paginated customer-visible message list.',
        type: conversation_message_list_entity_1.ConversationMessageListEntity,
    }),
    (0, common_1.Get)('conversations/:conversationId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, list_conversation_messages_query_dto_1.ListConversationMessagesQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerMessagingController.prototype, "listMessages", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'sendCurrentCustomerConversationMessage',
        summary: 'Send a message from the authenticated customer into a conversation',
    }),
    (0, swagger_1.ApiParam)({
        name: 'conversationId',
        description: 'Conversation identifier visible to the authenticated customer.',
        example: 'con_1',
    }),
    (0, swagger_1.ApiBody)({ type: send_conversation_message_dto_1.SendConversationMessageDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Persists a new customer message in the conversation.',
        type: sent_message_entity_1.SentMessageEntity,
    }),
    (0, common_1.Post)('conversations/:conversationId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, send_conversation_message_dto_1.SendConversationMessageDto]),
    __metadata("design:returntype", void 0)
], CustomerMessagingController.prototype, "sendMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'markCurrentCustomerMessageRead',
        summary: 'Record a customer read receipt for a message',
    }),
    (0, swagger_1.ApiParam)({
        name: 'messageId',
        description: 'Message identifier visible to the authenticated customer.',
        example: 'msg_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Records the customer read position for the message conversation.',
        type: mark_read_dto_1.MarkReadDto,
    }),
    (0, common_1.Post)('messages/:messageId/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", Promise)
], CustomerMessagingController.prototype, "markRead", null);
exports.CustomerMessagingController = CustomerMessagingController = __decorate([
    (0, swagger_1.ApiTags)('customer-messaging'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer'),
    __metadata("design:paramtypes", [messaging_rest_service_1.MessagingRestService])
], CustomerMessagingController);
//# sourceMappingURL=customer-messaging.controller.js.map