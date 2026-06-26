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
var NotificationEventService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEventService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const audit_service_1 = require("../../audit/services/audit.service");
const admin_inventory_alert_notification_entity_1 = require("../entities/admin-inventory-alert-notification.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
const notification_preferences_service_1 = require("./notification-preferences.service");
const notifications_service_1 = require("./notifications.service");
let NotificationEventService = NotificationEventService_1 = class NotificationEventService {
    constructor(notificationsService, notificationPreferencesService, queueService, notificationsRepository, auditService) {
        this.notificationsService = notificationsService;
        this.notificationPreferencesService = notificationPreferencesService;
        this.queueService = queueService;
        this.notificationsRepository = notificationsRepository;
        this.auditService = auditService;
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
                deliveryId: input.order.deliveryId ?? undefined,
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
    async publishMerchantInventoryAlert(input) {
        const hasRecentDuplicate = await this.notificationsService.hasRecentMerchantInventoryAlert({
            userId: input.merchantUserId,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            attentionLevel: input.attentionLevel,
            since: new Date(Date.now() - NotificationEventService_1.inventoryAlertCooldownMs),
        });
        if (hasRecentDuplicate) {
            return;
        }
        const notification = await this.notificationsService.createNotification({
            userId: input.merchantUserId,
            type: client_1.NotificationType.SYSTEM_ALERT,
            title: this.buildInventoryAlertTitle(input),
            body: this.buildInventoryAlertBody(input),
            navigationPath: `/merchant/branches/${input.branchId}/inventory/overview`,
            metadataJson: {
                alertKind: 'ATTENTION',
                branchId: input.branchId,
                branchName: input.branchName ?? null,
                resourceType: input.resourceType,
                resourceId: input.resourceId,
                resourceLabel: input.resourceLabel,
                attentionLevel: input.attentionLevel,
                stockQuantity: input.stockQuantity,
                lowStockThreshold: input.lowStockThreshold,
                menuItemName: input.menuItemName ?? null,
            },
        });
        await this.recordMerchantInventoryAlertDeliveries(notification.notificationId, input.merchantUserId);
    }
    async publishMerchantInventoryCompensationAlert(input) {
        const notification = await this.notificationsService.createNotification({
            userId: input.merchantUserId,
            type: client_1.NotificationType.SYSTEM_ALERT,
            title: this.buildInventoryCompensationTitle(input),
            body: this.buildInventoryCompensationBody(input),
            navigationPath: `/merchant/branches/${input.branchId}/inventory/overview`,
            metadataJson: {
                alertKind: 'COMPENSATION',
                branchId: input.branchId,
                branchName: input.branchName ?? null,
                resourceType: input.resourceType,
                resourceId: input.resourceId,
                resourceLabel: input.resourceLabel,
                restoredQuantity: input.restoredQuantity,
                stockQuantity: input.stockQuantity,
                lowStockThreshold: input.lowStockThreshold,
                menuItemName: input.menuItemName ?? null,
                orderId: input.orderId,
                orderCode: input.orderCode,
                reasonCode: input.reasonCode ?? null,
                note: input.note ?? null,
            },
            orderId: input.orderId,
        });
        await this.recordMerchantInventoryAlertDeliveries(notification.notificationId, input.merchantUserId);
        await this.autoResolveRecoveredInventoryAlerts(input, notification.notificationId);
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
            case client_1.SystemMessageCode.PAYMENT_PENDING:
            case client_1.SystemMessageCode.PAYMENT_SUCCEEDED:
            case client_1.SystemMessageCode.PAYMENT_FAILED:
            case client_1.SystemMessageCode.PAYMENT_CANCELLED:
                return client_1.NotificationType.PAYMENT_STATUS_UPDATED;
            case client_1.SystemMessageCode.REFUND_REQUESTED:
            case client_1.SystemMessageCode.REFUND_SUCCEEDED:
            case client_1.SystemMessageCode.REFUND_FAILED:
                return client_1.NotificationType.REFUND_STATUS_UPDATED;
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
            case client_1.SystemMessageCode.PAYMENT_PENDING:
            case client_1.SystemMessageCode.PAYMENT_SUCCEEDED:
            case client_1.SystemMessageCode.PAYMENT_FAILED:
            case client_1.SystemMessageCode.PAYMENT_CANCELLED:
                return `Payment update: ${orderCode}`;
            case client_1.SystemMessageCode.REFUND_REQUESTED:
            case client_1.SystemMessageCode.REFUND_SUCCEEDED:
            case client_1.SystemMessageCode.REFUND_FAILED:
                return `Refund update: ${orderCode}`;
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
    buildInventoryAlertTitle(input) {
        return input.attentionLevel === 'OUT_OF_STOCK'
            ? `Out of stock: ${input.resourceLabel}`
            : `Low stock: ${input.resourceLabel}`;
    }
    buildInventoryAlertBody(input) {
        const stockText = input.stockQuantity === null
            ? 'tracked stock requires attention'
            : `${input.stockQuantity} left`;
        const thresholdText = input.lowStockThreshold === null
            ? 'without a configured threshold'
            : `threshold ${input.lowStockThreshold}`;
        const subject = input.resourceType === 'ITEM_OPTION' && input.menuItemName
            ? `${input.menuItemName} - ${input.resourceLabel}`
            : input.resourceLabel;
        const branchLabel = input.branchName?.trim() || input.branchId;
        return input.attentionLevel === 'OUT_OF_STOCK'
            ? `${subject} is now out of stock in ${branchLabel}. Current stock: ${stockText}.`
            : `${subject} is now low in ${branchLabel} with ${stockText} (${thresholdText}).`;
    }
    buildInventoryCompensationTitle(input) {
        return `Stock restored: ${input.resourceLabel}`;
    }
    buildInventoryCompensationBody(input) {
        const subject = input.resourceType === 'ITEM_OPTION' && input.menuItemName
            ? `${input.menuItemName} - ${input.resourceLabel}`
            : input.resourceLabel;
        const branchLabel = input.branchName?.trim() || input.branchId;
        const stockText = input.stockQuantity === null
            ? 'tracked stock updated'
            : `current stock ${input.stockQuantity}`;
        const quantityLabel = input.restoredQuantity === 1
            ? '1 reserved unit was'
            : `${input.restoredQuantity} reserved units were`;
        const noteText = input.note?.trim() && input.note.trim().length > 0
            ? ` Note: ${input.note.trim()}.`
            : '';
        return `${quantityLabel} restored to ${subject} in ${branchLabel} for ${input.orderCode}; ${stockText}.${noteText}`;
    }
    async autoResolveRecoveredInventoryAlerts(input, compensationNotificationId) {
        const candidateNotifications = await this.notificationsRepository.listRecentInventoryAlertsByUserId(input.merchantUserId);
        const relatedAttentionAlerts = candidateNotifications
            .map((notification) => ({
            notification,
            metadata: (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification),
        }))
            .filter((candidate) => candidate.metadata !== null &&
            candidate.metadata.alertKind === 'ATTENTION' &&
            candidate.metadata.resourceType === input.resourceType &&
            candidate.metadata.resourceId === input.resourceId &&
            this.shouldAutoResolveAttentionAlert(candidate.metadata.attentionLevel, input.stockQuantity, input.lowStockThreshold));
        if (relatedAttentionAlerts.length === 0) {
            return;
        }
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(relatedAttentionAlerts.map(({ notification }) => notification.id));
        const latestLifecycleByNotificationId = new Map(lifecycleLogs.map((log) => [log.resourceId, log]));
        for (const { notification, metadata } of relatedAttentionAlerts) {
            const currentStatus = this.resolveInventoryAlertStatus(latestLifecycleByNotificationId.get(notification.id) ?? null);
            if (currentStatus === 'RESOLVED' ||
                currentStatus === 'DISMISSED') {
                continue;
            }
            await this.auditService.logAction({
                actorType: client_1.AuditActorType.SYSTEM,
                actorUserId: null,
                actorRole: null,
                actionSource: client_1.AuditActionSource.SYSTEM,
                action: NotificationEventService_1.inventoryAlertResolutionAction,
                resourceType: client_1.AuditResourceType.NOTIFICATION,
                resourceId: notification.id,
                resourceLabel: notification.title,
                targetUserId: notification.user.id,
                branchId: metadata.branchId,
                orderId: input.orderId,
                metadataJson: {
                    note: this.buildAutoResolutionNote(metadata.attentionLevel, input.orderCode, input.stockQuantity, input.lowStockThreshold),
                    notificationType: client_1.NotificationType.SYSTEM_ALERT,
                    alertKind: metadata.alertKind,
                    attentionLevel: metadata.attentionLevel,
                    resourceType: metadata.resourceType,
                    resourceId: metadata.resourceId,
                    resourceLabel: metadata.resourceLabel,
                    restoredQuantity: input.restoredQuantity,
                    orderId: input.orderId,
                    orderCode: input.orderCode,
                    reasonCode: input.reasonCode ?? null,
                    resolutionSource: 'inventory_compensation',
                    compensationNotificationId,
                    currentStockQuantity: input.stockQuantity,
                    currentLowStockThreshold: input.lowStockThreshold,
                },
            });
        }
    }
    shouldAutoResolveAttentionAlert(attentionLevel, stockQuantity, lowStockThreshold) {
        if (attentionLevel === null || stockQuantity === null) {
            return false;
        }
        if (attentionLevel === 'OUT_OF_STOCK') {
            return stockQuantity > 0;
        }
        if (lowStockThreshold === null) {
            return stockQuantity > 0;
        }
        return stockQuantity > lowStockThreshold;
    }
    buildAutoResolutionNote(attentionLevel, orderCode, stockQuantity, lowStockThreshold) {
        if (attentionLevel === 'OUT_OF_STOCK') {
            return stockQuantity === null
                ? `Auto-resolved after stock restoration for ${orderCode}.`
                : `Auto-resolved after stock restoration for ${orderCode}; stock is now ${stockQuantity}.`;
        }
        if (stockQuantity === null || lowStockThreshold === null) {
            return `Auto-resolved after stock restoration for ${orderCode}.`;
        }
        return `Auto-resolved after stock restoration for ${orderCode}; stock is now ${stockQuantity}, above threshold ${lowStockThreshold}.`;
    }
    resolveInventoryAlertStatus(lifecycleLog) {
        switch (lifecycleLog?.action) {
            case NotificationEventService_1.inventoryAlertDismissalAction:
                return 'DISMISSED';
            case NotificationEventService_1.inventoryAlertResolutionAction:
                return 'RESOLVED';
            case NotificationEventService_1.inventoryAlertAcknowledgementAction:
                return 'ACKNOWLEDGED';
            default:
                return 'OPEN';
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
        await this.queueService.add(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.pushNotification, {
            notificationId,
            attempt: 1,
        });
    }
    async recordMerchantInventoryAlertDeliveries(notificationId, merchantUserId) {
        const now = new Date();
        await this.notificationsService.createDeliveryAttempt({
            notificationId,
            channel: client_1.NotificationChannel.IN_APP,
            status: client_1.NotificationDeliveryStatus.DELIVERED,
            deliveredAt: now,
        });
        const shouldQueuePush = await this.notificationPreferencesService.shouldQueueMerchantInventoryAlertPush(merchantUserId, now);
        if (!shouldQueuePush) {
            return;
        }
        await this.notificationsService.createDeliveryAttempt({
            notificationId,
            channel: client_1.NotificationChannel.PUSH,
            status: client_1.NotificationDeliveryStatus.QUEUED,
            queuedAt: now,
        });
        await this.queueService.add(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.pushNotification, {
            notificationId,
            attempt: 1,
        });
    }
};
exports.NotificationEventService = NotificationEventService;
NotificationEventService.inventoryAlertCooldownMs = 15 * 60 * 1000;
NotificationEventService.inventoryAlertAcknowledgementAction = 'inventory_alerts.acknowledged';
NotificationEventService.inventoryAlertResolutionAction = 'inventory_alerts.resolved';
NotificationEventService.inventoryAlertDismissalAction = 'inventory_alerts.dismissed';
exports.NotificationEventService = NotificationEventService = NotificationEventService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        notification_preferences_service_1.NotificationPreferencesService,
        queue_service_1.QueueService,
        notifications_repository_1.NotificationsRepository,
        audit_service_1.AuditService])
], NotificationEventService);
//# sourceMappingURL=notification-event.service.js.map