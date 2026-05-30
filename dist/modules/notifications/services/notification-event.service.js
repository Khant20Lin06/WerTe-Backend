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
exports.NotificationEventService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const notifications_service_1 = require("./notifications.service");
let NotificationEventService = class NotificationEventService {
    constructor(notificationsService, queueService) {
        this.notificationsService = notificationsService;
        this.queueService = queueService;
    }
    async publishOrderEvent(input) {
        const recipientUserIds = this.resolveRecipientUserIds(input.conversation, input.currentUser.userId);
        for (const userId of recipientUserIds) {
            const notification = await this.notificationsService.createNotification({
                userId,
                type: this.mapSystemMessageCodeToNotificationType(input.code),
                title: this.buildOrderNotificationTitle(input.code, input.order.orderCode),
                body: input.message.body,
                navigationPath: `/orders/${input.order.orderId}`,
                metadataJson: {
                    orderCode: input.order.orderCode,
                    conversationId: input.conversation.conversationId,
                    messageId: input.message.messageId,
                    systemMessageCode: input.code,
                },
                orderId: input.order.orderId,
                conversationId: input.conversation.conversationId,
                messageId: input.message.messageId,
            });
            await this.recordDefaultDeliveries(notification.notificationId);
        }
    }
    async publishConversationMessage(input) {
        const recipientUserIds = this.resolveRecipientUserIds(input.conversation, input.currentUser.userId);
        for (const userId of recipientUserIds) {
            const notification = await this.notificationsService.createNotification({
                userId,
                type: client_1.NotificationType.MESSAGE_RECEIVED,
                title: this.buildConversationMessageTitle(input.order?.orderCode ?? null),
                body: this.buildConversationMessageBody(input.currentUser.role, input.message),
                navigationPath: `/messages/conversations/${input.conversation.conversationId}`,
                metadataJson: {
                    conversationId: input.conversation.conversationId,
                    messageId: input.message.messageId,
                    orderId: input.order?.orderId ?? null,
                    messageType: input.message.type,
                },
                orderId: input.order?.orderId ?? null,
                conversationId: input.conversation.conversationId,
                messageId: input.message.messageId,
            });
            await this.recordDefaultDeliveries(notification.notificationId);
        }
    }
    resolveRecipientUserIds(conversation, actorUserId) {
        return conversation.participants
            .filter((participant) => participant.leftAt === null &&
            participant.userId !== null &&
            participant.userId !== actorUserId)
            .map((participant) => participant.userId);
    }
    mapSystemMessageCodeToNotificationType(code) {
        switch (code) {
            case client_1.SystemMessageCode.RIDER_ASSIGNED:
                return client_1.NotificationType.ORDER_ASSIGNED;
            case client_1.SystemMessageCode.RIDER_ACCEPTED:
            case client_1.SystemMessageCode.RIDER_REJECTED_ASSIGNMENT:
            case client_1.SystemMessageCode.ORDER_PICKED_UP:
            case client_1.SystemMessageCode.ORDER_ON_THE_WAY:
            case client_1.SystemMessageCode.ORDER_DELIVERED:
            case client_1.SystemMessageCode.FAILED_DELIVERY:
            case client_1.SystemMessageCode.MERCHANT_HANDOFF_CONFIRMED:
            case client_1.SystemMessageCode.DELIVERY_PROOF_SUBMITTED:
                return client_1.NotificationType.DELIVERY_STATUS_UPDATED;
            case client_1.SystemMessageCode.ADMIN_INTERVENTION:
                return client_1.NotificationType.SUPPORT_UPDATE;
            default:
                return client_1.NotificationType.ORDER_STATUS_UPDATED;
        }
    }
    buildOrderNotificationTitle(code, orderCode) {
        switch (code) {
            case client_1.SystemMessageCode.RIDER_ASSIGNED:
                return `Rider assigned for ${orderCode}`;
            case client_1.SystemMessageCode.ORDER_DELIVERED:
                return `Order delivered: ${orderCode}`;
            case client_1.SystemMessageCode.ORDER_CANCELLED:
                return `Order cancelled: ${orderCode}`;
            case client_1.SystemMessageCode.ADMIN_INTERVENTION:
                return `Support updated ${orderCode}`;
            default:
                return `Order update: ${orderCode}`;
        }
    }
    buildConversationMessageTitle(orderCode) {
        return orderCode === null
            ? 'New conversation message'
            : `New message for ${orderCode}`;
    }
    buildConversationMessageBody(actorRole, message) {
        if (message.type === 'TEXT') {
            const trimmedBody = message.body.trim();
            return trimmedBody.length > 0
                ? trimmedBody
                : `${this.humanizeRole(actorRole)} sent a message.`;
        }
        switch (message.type) {
            case 'IMAGE':
                return `${this.humanizeRole(actorRole)} sent an image.`;
            case 'FILE':
                return `${this.humanizeRole(actorRole)} sent a file.`;
            case 'PROOF_OF_HANDOFF':
                return `${this.humanizeRole(actorRole)} shared handoff proof.`;
            case 'PROOF_OF_DELIVERY':
                return `${this.humanizeRole(actorRole)} shared delivery proof.`;
            default:
                return `${this.humanizeRole(actorRole)} sent a message.`;
        }
    }
    humanizeRole(role) {
        switch (role) {
            case client_1.UserRole.CUSTOMER:
                return 'Customer';
            case client_1.UserRole.MERCHANT:
                return 'Merchant';
            case client_1.UserRole.RIDER:
                return 'Rider';
            case client_1.UserRole.ADMIN:
                return 'Admin';
            case client_1.UserRole.SUPPORT:
                return 'Support';
            default:
                return 'User';
        }
    }
    async recordDefaultDeliveries(notificationId) {
        const now = new Date();
        await this.notificationsService.createDeliveryAttempt({
            notificationId,
            channel: client_1.NotificationChannel.IN_APP,
            status: client_1.NotificationDeliveryStatus.DELIVERED,
            deliveredAt: now,
        });
        await this.notificationsService.createDeliveryAttempt({
            notificationId,
            channel: client_1.NotificationChannel.PUSH,
            status: client_1.NotificationDeliveryStatus.QUEUED,
            queuedAt: now,
        });
        await this.queueService.add(queue_constants_1.QueueNames.notifications, 'push-notification', {
            notificationId,
        });
    }
};
exports.NotificationEventService = NotificationEventService;
exports.NotificationEventService = NotificationEventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        queue_service_1.QueueService])
], NotificationEventService);
//# sourceMappingURL=notification-event.service.js.map