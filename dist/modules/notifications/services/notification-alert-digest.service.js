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
var NotificationAlertDigestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAlertDigestService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../../../infrastructure/logging/app.logger");
const queue_constants_1 = require("../../../infrastructure/queue/queue.constants");
const queue_service_1 = require("../../../infrastructure/queue/queue.service");
const audit_service_1 = require("../../audit/services/audit.service");
const users_service_1 = require("../../users/services/users.service");
const admin_inventory_alert_notification_entity_1 = require("../entities/admin-inventory-alert-notification.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
const notification_preferences_service_1 = require("./notification-preferences.service");
const notifications_service_1 = require("./notifications.service");
const inventoryAlertReminderAction = 'inventory_alerts.reminder_sent';
const inventoryAlertEscalationAction = 'inventory_alerts.escalated';
let NotificationAlertDigestService = NotificationAlertDigestService_1 = class NotificationAlertDigestService {
    constructor(notificationsRepository, notificationsService, notificationPreferencesService, queueService, auditService, usersService, logger) {
        this.notificationsRepository = notificationsRepository;
        this.notificationsService = notificationsService;
        this.notificationPreferencesService = notificationPreferencesService;
        this.queueService = queueService;
        this.auditService = auditService;
        this.usersService = usersService;
        this.logger = logger;
    }
    async runDigestCycle(at = new Date()) {
        const notifications = await this.notificationsRepository.listRecentInventoryAlerts(NotificationAlertDigestService_1.scanLimit);
        const attentionAlerts = notifications
            .map((notification) => ({
            notification,
            metadata: (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification),
        }))
            .filter((candidate) => candidate.metadata !== null &&
            candidate.metadata.alertKind === 'ATTENTION');
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(attentionAlerts.map(({ notification }) => notification.id));
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        const followUpLogs = await this.auditService.listInventoryAlertFollowUpLogs(attentionAlerts.map(({ notification }) => notification.id));
        const latestReminderLogByNotificationId = this.buildLatestActionLogMap(followUpLogs, inventoryAlertReminderAction);
        const latestEscalationLogByNotificationId = this.buildLatestActionLogMap(followUpLogs, inventoryAlertEscalationAction);
        const unresolvedAttentionAlerts = attentionAlerts
            .map(({ notification, metadata }) => ({
            notification,
            metadata,
            status: this.resolveInventoryAlertStatus(latestLifecycleByNotificationId.get(notification.id) ?? null),
        }))
            .filter((candidate) => candidate.status === 'OPEN' || candidate.status === 'ACKNOWLEDGED');
        const merchantReminderCandidates = unresolvedAttentionAlerts.filter(({ notification }) => this.isOlderThan(notification.createdAt, NotificationAlertDigestService_1.merchantReminderAgeMs, at) &&
            !this.hasRecentLog(latestReminderLogByNotificationId.get(notification.id) ?? null, NotificationAlertDigestService_1.merchantReminderCooldownMs, at));
        const adminEscalationCandidates = unresolvedAttentionAlerts.filter(({ notification }) => this.isOlderThan(notification.createdAt, NotificationAlertDigestService_1.adminEscalationAgeMs, at) &&
            !this.hasRecentLog(latestEscalationLogByNotificationId.get(notification.id) ?? null, NotificationAlertDigestService_1.adminEscalationCooldownMs, at));
        const merchantReminderGroups = this.groupByMerchantAndBranch(merchantReminderCandidates);
        const adminEscalationGroups = this.groupByMerchantAndBranch(adminEscalationCandidates);
        let merchantReminderDigestCount = 0;
        let reminderSourceAlertCount = 0;
        for (const group of merchantReminderGroups) {
            const reminderNotification = await this.notificationsService.createNotification({
                userId: group.merchantUserId,
                type: client_1.NotificationType.SUPPORT_UPDATE,
                title: this.buildMerchantReminderTitle(group),
                body: this.buildMerchantReminderBody(group),
                navigationPath: `/merchant/branches/${group.branchId}/inventory/overview`,
                metadataJson: {
                    digestKind: 'MERCHANT_INVENTORY_REMINDER',
                    branchId: group.branchId,
                    branchName: group.branchName,
                    alertNotificationIds: group.alerts.map(({ notification }) => notification.id),
                    attentionAlertCount: group.alerts.length,
                    oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
                },
            });
            await this.recordMerchantReminderDeliveries(reminderNotification.notificationId, group.merchantUserId, at);
            for (const { notification, metadata } of group.alerts) {
                await this.auditService.logAction({
                    actorType: client_1.AuditActorType.SYSTEM,
                    actorUserId: null,
                    actorRole: null,
                    actionSource: client_1.AuditActionSource.JOB,
                    action: inventoryAlertReminderAction,
                    resourceType: client_1.AuditResourceType.NOTIFICATION,
                    resourceId: notification.id,
                    resourceLabel: notification.title,
                    targetUserId: group.merchantUserId,
                    branchId: metadata.branchId,
                    metadataJson: {
                        reminderNotificationId: reminderNotification.notificationId,
                        digestKind: 'MERCHANT_INVENTORY_REMINDER',
                        attentionAlertCount: group.alerts.length,
                        oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
                    },
                });
            }
            merchantReminderDigestCount += 1;
            reminderSourceAlertCount += group.alerts.length;
        }
        const activeOpsUsers = adminEscalationGroups.length
            ? await this.usersService.listActiveByRoles([client_1.UserRole.ADMIN, client_1.UserRole.SUPPORT])
            : [];
        let adminEscalationDigestCount = 0;
        let escalationSourceAlertCount = 0;
        for (const group of adminEscalationGroups) {
            if (activeOpsUsers.length === 0) {
                break;
            }
            const escalationNotificationIds = [];
            for (const user of activeOpsUsers) {
                const notification = await this.notificationsService.createNotification({
                    userId: user.id,
                    type: client_1.NotificationType.SUPPORT_UPDATE,
                    title: this.buildAdminEscalationTitle(group),
                    body: this.buildAdminEscalationBody(group, at),
                    navigationPath: `/admin/inventory-alerts?status=OPEN&branchId=${group.branchId}`,
                    metadataJson: {
                        digestKind: 'ADMIN_INVENTORY_ESCALATION',
                        branchId: group.branchId,
                        branchName: group.branchName,
                        merchantUserId: group.merchantUserId,
                        merchantPhone: group.merchantPhone,
                        alertNotificationIds: group.alerts.map(({ notification: alertNotification }) => alertNotification.id),
                        attentionAlertCount: group.alerts.length,
                        oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
                    },
                });
                await this.notificationsService.createDeliveryAttempt({
                    notificationId: notification.notificationId,
                    channel: client_1.NotificationChannel.IN_APP,
                    status: client_1.NotificationDeliveryStatus.DELIVERED,
                    deliveredAt: at,
                });
                escalationNotificationIds.push(notification.notificationId);
            }
            for (const { notification, metadata } of group.alerts) {
                await this.auditService.logAction({
                    actorType: client_1.AuditActorType.SYSTEM,
                    actorUserId: null,
                    actorRole: null,
                    actionSource: client_1.AuditActionSource.JOB,
                    action: inventoryAlertEscalationAction,
                    resourceType: client_1.AuditResourceType.NOTIFICATION,
                    resourceId: notification.id,
                    resourceLabel: notification.title,
                    targetUserId: null,
                    branchId: metadata.branchId,
                    metadataJson: {
                        escalationNotificationIds,
                        digestKind: 'ADMIN_INVENTORY_ESCALATION',
                        attentionAlertCount: group.alerts.length,
                        oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
                        recipientCount: activeOpsUsers.length,
                    },
                });
            }
            adminEscalationDigestCount += activeOpsUsers.length;
            escalationSourceAlertCount += group.alerts.length;
        }
        const result = {
            attentionAlertsScanned: attentionAlerts.length,
            merchantReminderDigestCount,
            reminderSourceAlertCount,
            adminEscalationDigestCount,
            escalationSourceAlertCount,
        };
        this.logger.logEvent('Inventory alert digest cycle processed.', result, 'NotificationAlertDigestService');
        return result;
    }
    groupByMerchantAndBranch(alerts) {
        const groups = new Map();
        for (const alert of alerts) {
            const branchId = alert.metadata.branchId ?? 'unknown_branch';
            const branchName = alert.metadata.branchName ?? branchId;
            const groupKey = `${alert.notification.user.id}::${branchId}`;
            const existing = groups.get(groupKey);
            if (existing === undefined) {
                groups.set(groupKey, {
                    merchantUserId: alert.notification.user.id,
                    merchantPhone: alert.notification.user.phone,
                    branchId,
                    branchName,
                    alerts: [alert],
                });
                continue;
            }
            existing.alerts.push(alert);
        }
        return [...groups.values()];
    }
    buildLatestLifecycleLogMap(logs) {
        const latestLogsByNotificationId = new Map();
        for (const log of logs) {
            if (!latestLogsByNotificationId.has(log.resourceId)) {
                latestLogsByNotificationId.set(log.resourceId, log);
            }
        }
        return latestLogsByNotificationId;
    }
    buildLatestActionLogMap(logs, action) {
        const latestLogsByNotificationId = new Map();
        for (const log of logs) {
            if (log.action !== action || latestLogsByNotificationId.has(log.resourceId)) {
                continue;
            }
            latestLogsByNotificationId.set(log.resourceId, log);
        }
        return latestLogsByNotificationId;
    }
    resolveInventoryAlertStatus(lifecycleLog) {
        switch (lifecycleLog?.action) {
            case 'inventory_alerts.dismissed':
                return 'DISMISSED';
            case 'inventory_alerts.resolved':
                return 'RESOLVED';
            case 'inventory_alerts.acknowledged':
                return 'ACKNOWLEDGED';
            default:
                return 'OPEN';
        }
    }
    isOlderThan(createdAt, ageMs, at) {
        return createdAt.getTime() <= at.getTime() - ageMs;
    }
    hasRecentLog(log, cooldownMs, at) {
        if (log === null) {
            return false;
        }
        return new Date(log.createdAt).getTime() >= at.getTime() - cooldownMs;
    }
    buildMerchantReminderTitle(group) {
        return `Inventory reminder: ${group.branchName}`;
    }
    buildMerchantReminderBody(group) {
        const labels = this.buildLabelPreview(group.alerts);
        const count = group.alerts.length;
        return count === 1
            ? `1 shortage alert still needs attention in ${group.branchName}: ${labels}.`
            : `${count} shortage alerts still need attention in ${group.branchName}: ${labels}.`;
    }
    buildAdminEscalationTitle(group) {
        return `Inventory escalation: ${group.branchName}`;
    }
    buildAdminEscalationBody(group, at) {
        const labels = this.buildLabelPreview(group.alerts);
        const oldestAlertAgeMinutes = Math.max(1, Math.floor((at.getTime() -
            Math.min(...group.alerts.map(({ notification }) => notification.createdAt.getTime()))) /
            60_000));
        const count = group.alerts.length;
        return count === 1
            ? `1 shortage alert has stayed unresolved in ${group.branchName} for about ${oldestAlertAgeMinutes} minutes (${labels}). Merchant: ${group.merchantPhone}.`
            : `${count} shortage alerts have stayed unresolved in ${group.branchName} for about ${oldestAlertAgeMinutes} minutes (${labels}). Merchant: ${group.merchantPhone}.`;
    }
    buildLabelPreview(alerts) {
        const labels = alerts.map(({ metadata }) => metadata.resourceLabel);
        if (labels.length <= 3) {
            return labels.join(', ');
        }
        return `${labels.slice(0, 3).join(', ')} and ${labels.length - 3} more`;
    }
    resolveOldestCreatedAt(alerts) {
        return new Date(Math.min(...alerts.map(({ notification }) => notification.createdAt.getTime()))).toISOString();
    }
    async recordMerchantReminderDeliveries(notificationId, merchantUserId, at) {
        await this.notificationsService.createDeliveryAttempt({
            notificationId,
            channel: client_1.NotificationChannel.IN_APP,
            status: client_1.NotificationDeliveryStatus.DELIVERED,
            deliveredAt: at,
        });
        const shouldQueuePush = await this.notificationPreferencesService.shouldQueueMerchantInventoryAlertPush(merchantUserId, at);
        if (!shouldQueuePush) {
            return;
        }
        await this.notificationsService.createDeliveryAttempt({
            notificationId,
            channel: client_1.NotificationChannel.PUSH,
            status: client_1.NotificationDeliveryStatus.QUEUED,
            queuedAt: at,
        });
        await this.queueService.add(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.pushNotification, {
            notificationId,
            attempt: 1,
        });
    }
};
exports.NotificationAlertDigestService = NotificationAlertDigestService;
NotificationAlertDigestService.scanLimit = 500;
NotificationAlertDigestService.merchantReminderAgeMs = 30 * 60 * 1000;
NotificationAlertDigestService.merchantReminderCooldownMs = 6 * 60 * 60 * 1000;
NotificationAlertDigestService.adminEscalationAgeMs = 2 * 60 * 60 * 1000;
NotificationAlertDigestService.adminEscalationCooldownMs = 12 * 60 * 60 * 1000;
exports.NotificationAlertDigestService = NotificationAlertDigestService = NotificationAlertDigestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        notifications_service_1.NotificationsService,
        notification_preferences_service_1.NotificationPreferencesService,
        queue_service_1.QueueService,
        audit_service_1.AuditService,
        users_service_1.UsersService,
        app_logger_1.AppLogger])
], NotificationAlertDigestService);
//# sourceMappingURL=notification-alert-digest.service.js.map