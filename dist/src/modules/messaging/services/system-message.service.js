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
exports.SystemMessageService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const app_logger_1 = require("../../../infrastructure/logging/app.logger");
const audit_event_service_1 = require("../../audit/services/audit-event.service");
const notification_event_service_1 = require("../../notifications/services/notification-event.service");
const message_policy_service_1 = require("../policies/message-policy.service");
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
const message_delivery_service_1 = require("./message-delivery.service");
const system_message_template_service_1 = require("./system-message-template.service");
let SystemMessageService = class SystemMessageService {
    constructor(logger, conversationRepository, messagePolicyService, messageRepository, messageDeliveryService, templateService, notificationEventService, auditEventService) {
        this.logger = logger;
        this.conversationRepository = conversationRepository;
        this.messagePolicyService = messagePolicyService;
        this.messageRepository = messageRepository;
        this.messageDeliveryService = messageDeliveryService;
        this.templateService = templateService;
        this.notificationEventService = notificationEventService;
        this.auditEventService = auditEventService;
    }
    async publishOrderEvent(currentUser, input) {
        try {
            await this.publishOrderEventOrThrow(currentUser, input);
        }
        catch (error) {
            this.logger.warnEvent('System order event message could not be published.', {
                orderId: input.orderId,
                code: input.code,
                actorUserId: currentUser.userId,
                error: error instanceof Error
                    ? {
                        message: error.message,
                        name: error.name,
                    }
                    : String(error),
            }, 'SystemMessageService');
        }
    }
    async publishOrderEventOrThrow(currentUser, input) {
        const order = await this.conversationRepository.findOrderContextById(input.orderId);
        if (order === null) {
            return;
        }
        const participants = this.messagePolicyService.buildConversationParticipants(currentUser, order, client_1.ConversationType.ORDER_CHAT);
        if (participants === null || participants.length === 0) {
            return;
        }
        const conversation = await this.conversationRepository.resolve({
            orderId: order.orderId,
            type: client_1.ConversationType.ORDER_CHAT,
            title: this.messagePolicyService.buildConversationTitle(order, client_1.ConversationType.ORDER_CHAT),
            participants,
        });
        const body = await this.templateService.render(input.code, {
            orderCode: order.orderCode,
            merchantName: order.merchant.merchantName,
            branchName: order.branch.branchName,
            riderName: order.rider?.displayName ?? 'The rider',
            reasonCode: '',
            note: '',
            ...input.templateVariables,
        });
        const receiptUserIds = conversation.participants
            .filter((participant) => participant.leftAt === null)
            .map((participant) => participant.userId)
            .filter((userId) => userId !== null);
        const message = await this.messageRepository.createSystemEvent({
            conversationId: conversation.conversationId,
            systemEventCode: input.code,
            body,
            metadataJson: input.metadata,
            receiptUserIds,
        });
        this.messageDeliveryService.emitMessageCreated(message);
        this.messageDeliveryService.emitConversationUpdated(conversation.conversationId);
        await this.messageDeliveryService.queuePushFallback(conversation.conversationId);
        await this.publishSideEffects(currentUser, {
            order,
            conversation,
            message,
            code: input.code,
            metadata: input.metadata,
        });
    }
    async publishSideEffects(currentUser, input) {
        const results = await Promise.allSettled([
            this.notificationEventService.publishOrderEvent({
                currentUser,
                order: input.order,
                conversation: input.conversation,
                message: input.message,
                code: input.code,
            }),
            this.auditEventService.publishOrderEvent({
                currentUser,
                order: input.order,
                conversation: input.conversation,
                message: input.message,
                code: input.code,
                metadataJson: input.metadata,
            }),
        ]);
        for (const result of results) {
            if (result.status === 'rejected') {
                this.logger.warnEvent('System order event side effect could not be published.', {
                    orderId: input.order.orderId,
                    code: input.code,
                    actorUserId: currentUser.userId,
                    error: result.reason instanceof Error
                        ? {
                            message: result.reason.message,
                            name: result.reason.name,
                        }
                        : String(result.reason),
                }, 'SystemMessageService');
            }
        }
    }
};
exports.SystemMessageService = SystemMessageService;
exports.SystemMessageService = SystemMessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_logger_1.AppLogger,
        conversation_repository_1.ConversationRepository,
        message_policy_service_1.MessagePolicyService,
        message_repository_1.MessageRepository,
        message_delivery_service_1.MessageDeliveryService,
        system_message_template_service_1.SystemMessageTemplateService,
        notification_event_service_1.NotificationEventService,
        audit_event_service_1.AuditEventService])
], SystemMessageService);
//# sourceMappingURL=system-message.service.js.map