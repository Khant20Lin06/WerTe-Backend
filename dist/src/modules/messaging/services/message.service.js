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
exports.MessageService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const audit_event_service_1 = require("../../audit/services/audit-event.service");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const send_message_attachment_dto_1 = require("../dto/send-message-attachment.dto");
const send_message_dto_1 = require("../dto/send-message.dto");
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
const message_delivery_service_1 = require("./message-delivery.service");
const message_policy_service_1 = require("./message-policy.service");
const messageTypeMap = {
    [send_message_dto_1.SendMessageTypeValue.text]: client_1.MessageType.TEXT,
    [send_message_dto_1.SendMessageTypeValue.image]: client_1.MessageType.IMAGE,
    [send_message_dto_1.SendMessageTypeValue.file]: client_1.MessageType.FILE,
    [send_message_dto_1.SendMessageTypeValue.proofOfHandoff]: client_1.MessageType.PROOF_OF_HANDOFF,
    [send_message_dto_1.SendMessageTypeValue.proofOfDelivery]: client_1.MessageType.PROOF_OF_DELIVERY,
};
const attachmentTypeMap = {
    [send_message_attachment_dto_1.SendMessageAttachmentTypeValue.image]: client_1.MessageAttachmentType.IMAGE,
    [send_message_attachment_dto_1.SendMessageAttachmentTypeValue.file]: client_1.MessageAttachmentType.FILE,
    [send_message_attachment_dto_1.SendMessageAttachmentTypeValue.proofOfHandoff]: client_1.MessageAttachmentType.PROOF_OF_HANDOFF,
    [send_message_attachment_dto_1.SendMessageAttachmentTypeValue.proofOfDelivery]: client_1.MessageAttachmentType.PROOF_OF_DELIVERY,
};
let MessageService = class MessageService {
    constructor(conversationRepository, messageRepository, messagingPolicyService, messageDeliveryService, notificationEventService, auditEventService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messagingPolicyService = messagingPolicyService;
        this.messageDeliveryService = messageDeliveryService;
        this.notificationEventService = notificationEventService;
        this.auditEventService = auditEventService;
    }
    async send(currentUser, dto) {
        const conversation = await this.conversationRepository.findResolvedById(dto.conversationId);
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
        const messageType = this.resolveMessageType(dto);
        if (!this.messagingPolicyService.canSendMessage(currentUser, conversation, messageType)) {
            throw new app_exception_1.AppException('You are not allowed to send this message type in the conversation.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        const attachments = this.mapAttachments(dto.attachments ?? []);
        this.assertValidPayload(messageType, dto.body, attachments);
        for (const attachment of attachments) {
            if (!this.messagingPolicyService.canSendAttachment(currentUser, conversation, attachment.type)) {
                throw new app_exception_1.AppException('You are not allowed to send this attachment type in the conversation.', common_1.HttpStatus.FORBIDDEN, {
                    code: error_codes_1.ErrorCodes.forbidden,
                });
            }
        }
        const receiptUserIds = conversation.participants
            .filter((participant) => participant.leftAt === null)
            .map((participant) => participant.userId)
            .filter((userId) => userId !== null);
        const message = await this.messageRepository.create({
            conversationId: conversation.conversationId,
            senderKind: 'USER',
            senderId: currentUser.userId,
            type: messageType,
            body: dto.body?.trim() ?? '',
            attachments: attachments.map((attachment) => ({
                ...attachment,
                visibility: this.resolveAttachmentVisibility(attachment.type),
            })),
            receiptUserIds,
        });
        this.messageDeliveryService.emitMessageCreated(message);
        this.messageDeliveryService.emitConversationUpdated(conversation.conversationId);
        await this.messageDeliveryService.queuePushFallback(conversation.conversationId);
        const order = await this.conversationRepository.findOrderContextById(conversation.orderId);
        await Promise.allSettled([
            this.notificationEventService.publishConversationMessage({
                currentUser,
                order,
                conversation,
                message,
            }),
            this.auditEventService.publishConversationMessage({
                currentUser,
                order,
                conversation,
                message,
            }),
        ]);
        return message;
    }
    resolveMessageType(dto) {
        return dto.type === undefined ? client_1.MessageType.TEXT : messageTypeMap[dto.type];
    }
    mapAttachments(attachments) {
        return attachments.map((attachment) => ({
            type: attachmentTypeMap[attachment.type],
            storageKey: attachment.storageKey,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
            fileSizeBytes: attachment.fileSizeBytes,
            width: attachment.width,
            height: attachment.height,
        }));
    }
    assertValidPayload(messageType, body, attachments) {
        const trimmedBody = body?.trim() ?? '';
        if (messageType === client_1.MessageType.TEXT) {
            if (trimmedBody.length === 0) {
                throw new app_exception_1.AppException('Text messages require a non-empty body.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                });
            }
            if (attachments.length > 0) {
                throw new app_exception_1.AppException('Text messages cannot include attachments.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                    code: error_codes_1.ErrorCodes.unprocessableEntity,
                });
            }
            return;
        }
        if (attachments.length === 0) {
            throw new app_exception_1.AppException('This message type requires at least one attachment.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
        const expectedAttachmentType = this.resolveExpectedAttachmentType(messageType);
        if (!attachments.every((attachment) => attachment.type === expectedAttachmentType)) {
            throw new app_exception_1.AppException('Attachment type does not match the selected message type.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    resolveExpectedAttachmentType(messageType) {
        switch (messageType) {
            case client_1.MessageType.IMAGE:
                return client_1.MessageAttachmentType.IMAGE;
            case client_1.MessageType.FILE:
                return client_1.MessageAttachmentType.FILE;
            case client_1.MessageType.PROOF_OF_HANDOFF:
                return client_1.MessageAttachmentType.PROOF_OF_HANDOFF;
            case client_1.MessageType.PROOF_OF_DELIVERY:
                return client_1.MessageAttachmentType.PROOF_OF_DELIVERY;
            default:
                return client_1.MessageAttachmentType.FILE;
        }
    }
    resolveAttachmentVisibility(attachmentType) {
        switch (attachmentType) {
            case client_1.MessageAttachmentType.PROOF_OF_HANDOFF:
                return client_1.MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN;
            case client_1.MessageAttachmentType.PROOF_OF_DELIVERY:
                return client_1.MessageAttachmentVisibility.RIDER_CUSTOMER_ADMIN;
            default:
                return client_1.MessageAttachmentVisibility.ALL_PARTICIPANTS;
        }
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversation_repository_1.ConversationRepository,
        message_repository_1.MessageRepository,
        message_policy_service_1.MessagingPolicyService,
        message_delivery_service_1.MessageDeliveryService,
        notification_event_service_1.NotificationEventService,
        audit_event_service_1.AuditEventService])
], MessageService);
//# sourceMappingURL=message.service.js.map