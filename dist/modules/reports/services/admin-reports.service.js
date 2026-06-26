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
exports.AdminReportsService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const admin_inventory_alert_dto_1 = require("../../notifications/dto/admin-inventory-alert.dto");
const admin_inventory_alert_notification_entity_1 = require("../../notifications/entities/admin-inventory-alert-notification.entity");
const list_admin_inventory_alert_report_query_dto_1 = require("../dto/list-admin-inventory-alert-report-query.dto");
const inventoryAlertAcknowledgementAction = 'inventory_alerts.acknowledged';
const inventoryAlertResolutionAction = 'inventory_alerts.resolved';
const inventoryAlertDismissalAction = 'inventory_alerts.dismissed';
const inventoryAlertReminderAction = 'inventory_alerts.reminder_sent';
const inventoryAlertEscalationAction = 'inventory_alerts.escalated';
const inventoryAlertReportNotificationSelect = client_1.Prisma.validator()({
    id: true,
    userId: true,
    type: true,
    readAt: true,
    createdAt: true,
    metadataJson: true,
    deliveries: {
        select: {
            channel: true,
            status: true,
        },
    },
});
let AdminReportsService = class AdminReportsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getInventoryAlertOverview(currentUser, query) {
        this.assertAdmin(currentUser);
        const analyticsWindow = await this.loadInventoryAlertAnalyticsWindow(query);
        const kindCounts = {
            attentionAlertsCount: 0,
            compensationAlertsCount: 0,
        };
        const statusCounts = {
            openAlertsCount: 0,
            acknowledgedAlertsCount: 0,
            resolvedAlertsCount: 0,
            dismissedAlertsCount: 0,
        };
        const attentionLevelCounts = {
            lowStockAlertsCount: 0,
            outOfStockAlertsCount: 0,
        };
        const resourceTypeCounts = {
            menuItemAlertsCount: 0,
            itemOptionAlertsCount: 0,
        };
        const followUpCounts = {
            reminderCount: 0,
            escalationCount: 0,
        };
        const deliveryCounts = {
            pushPendingCount: 0,
            pushQueuedCount: 0,
            pushSentCount: 0,
            pushDeliveredCount: 0,
            pushFailedCount: 0,
        };
        const branchMap = new Map();
        let unreadMerchantAlertsCount = 0;
        for (const alert of analyticsWindow.alerts) {
            if (alert.readAt === null) {
                unreadMerchantAlertsCount += 1;
            }
            if (alert.metadata.alertKind === 'ATTENTION') {
                kindCounts.attentionAlertsCount += 1;
            }
            else {
                kindCounts.compensationAlertsCount += 1;
            }
            switch (alert.status) {
                case admin_inventory_alert_dto_1.AdminInventoryAlertStatus.ACKNOWLEDGED:
                    statusCounts.acknowledgedAlertsCount += 1;
                    break;
                case admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED:
                    statusCounts.resolvedAlertsCount += 1;
                    break;
                case admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED:
                    statusCounts.dismissedAlertsCount += 1;
                    break;
                default:
                    statusCounts.openAlertsCount += 1;
                    break;
            }
            if (alert.metadata.attentionLevel === 'LOW_STOCK') {
                attentionLevelCounts.lowStockAlertsCount += 1;
            }
            else if (alert.metadata.attentionLevel === 'OUT_OF_STOCK') {
                attentionLevelCounts.outOfStockAlertsCount += 1;
            }
            if (alert.metadata.resourceType === 'MENU_ITEM') {
                resourceTypeCounts.menuItemAlertsCount += 1;
            }
            else {
                resourceTypeCounts.itemOptionAlertsCount += 1;
            }
            for (const followUpLog of alert.followUpLogs) {
                if (followUpLog.action === inventoryAlertReminderAction) {
                    followUpCounts.reminderCount += 1;
                }
                else if (followUpLog.action === inventoryAlertEscalationAction) {
                    followUpCounts.escalationCount += 1;
                }
            }
            for (const delivery of alert.deliveries) {
                if (delivery.channel !== client_1.NotificationChannel.PUSH) {
                    continue;
                }
                switch (delivery.status) {
                    case client_1.NotificationDeliveryStatus.PENDING:
                        deliveryCounts.pushPendingCount += 1;
                        break;
                    case client_1.NotificationDeliveryStatus.QUEUED:
                        deliveryCounts.pushQueuedCount += 1;
                        break;
                    case client_1.NotificationDeliveryStatus.SENT:
                        deliveryCounts.pushSentCount += 1;
                        break;
                    case client_1.NotificationDeliveryStatus.DELIVERED:
                        deliveryCounts.pushDeliveredCount += 1;
                        break;
                    case client_1.NotificationDeliveryStatus.FAILED:
                        deliveryCounts.pushFailedCount += 1;
                        break;
                }
            }
            const branchKey = alert.metadata.branchId ?? '__unscoped__';
            const branchSummary = branchMap.get(branchKey) ?? {
                branchId: alert.metadata.branchId,
                branchName: alert.metadata.branchName,
                totalAlertsCount: 0,
                openLifecycleAlertsCount: 0,
                escalatedAlertsCount: 0,
            };
            branchSummary.totalAlertsCount += 1;
            if (alert.status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN ||
                alert.status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.ACKNOWLEDGED) {
                branchSummary.openLifecycleAlertsCount += 1;
            }
            branchSummary.escalatedAlertsCount += alert.followUpLogs.filter((log) => log.action === inventoryAlertEscalationAction).length;
            branchMap.set(branchKey, branchSummary);
        }
        return {
            generatedAt: analyticsWindow.generatedAt.toISOString(),
            windowStartedAt: analyticsWindow.windowStartedAt.toISOString(),
            windowEndedAt: analyticsWindow.windowEndedAt.toISOString(),
            periodDays: analyticsWindow.periodDays,
            totalAlertsCount: analyticsWindow.alerts.length,
            unreadMerchantAlertsCount,
            kindCounts,
            statusCounts,
            attentionLevelCounts,
            resourceTypeCounts,
            followUpCounts,
            deliveryCounts,
            topBranches: [...branchMap.values()]
                .sort((left, right) => {
                if (right.totalAlertsCount !== left.totalAlertsCount) {
                    return right.totalAlertsCount - left.totalAlertsCount;
                }
                if (right.openLifecycleAlertsCount !== left.openLifecycleAlertsCount) {
                    return right.openLifecycleAlertsCount - left.openLifecycleAlertsCount;
                }
                return (left.branchName ?? '').localeCompare(right.branchName ?? '');
            })
                .slice(0, 5),
        };
    }
    async getInventoryAlertTrends(currentUser, query) {
        this.assertAdmin(currentUser);
        const analyticsWindow = await this.loadInventoryAlertAnalyticsWindow(query);
        const bucketMap = new Map();
        for (let offset = 0; offset < analyticsWindow.periodDays; offset += 1) {
            const bucketDate = new Date(analyticsWindow.windowStartedAt);
            bucketDate.setUTCDate(bucketDate.getUTCDate() + offset);
            const bucketKey = this.toUtcDateKey(bucketDate);
            bucketMap.set(bucketKey, {
                date: bucketKey,
                createdAlertsCount: 0,
                attentionAlertsCount: 0,
                compensationAlertsCount: 0,
                unreadMerchantAlertsCount: 0,
                acknowledgedCount: 0,
                resolvedCount: 0,
                dismissedCount: 0,
                reminderCount: 0,
                escalationCount: 0,
            });
        }
        for (const alert of analyticsWindow.alerts) {
            const bucket = bucketMap.get(this.toUtcDateKey(alert.createdAt));
            if (bucket === undefined) {
                continue;
            }
            bucket.createdAlertsCount += 1;
            if (alert.metadata.alertKind === 'ATTENTION') {
                bucket.attentionAlertsCount += 1;
            }
            else {
                bucket.compensationAlertsCount += 1;
            }
            if (alert.readAt === null) {
                bucket.unreadMerchantAlertsCount += 1;
            }
        }
        for (const lifecycleLog of analyticsWindow.lifecycleLogs) {
            const bucket = bucketMap.get(this.toUtcDateKey(new Date(lifecycleLog.createdAt)));
            if (bucket === undefined) {
                continue;
            }
            switch (lifecycleLog.action) {
                case inventoryAlertAcknowledgementAction:
                    bucket.acknowledgedCount += 1;
                    break;
                case inventoryAlertResolutionAction:
                    bucket.resolvedCount += 1;
                    break;
                case inventoryAlertDismissalAction:
                    bucket.dismissedCount += 1;
                    break;
            }
        }
        for (const followUpLog of analyticsWindow.followUpLogs) {
            const bucket = bucketMap.get(this.toUtcDateKey(new Date(followUpLog.createdAt)));
            if (bucket === undefined) {
                continue;
            }
            if (followUpLog.action === inventoryAlertReminderAction) {
                bucket.reminderCount += 1;
            }
            else if (followUpLog.action === inventoryAlertEscalationAction) {
                bucket.escalationCount += 1;
            }
        }
        return {
            generatedAt: analyticsWindow.generatedAt.toISOString(),
            windowStartedAt: analyticsWindow.windowStartedAt.toISOString(),
            windowEndedAt: analyticsWindow.windowEndedAt.toISOString(),
            periodDays: analyticsWindow.periodDays,
            buckets: [...bucketMap.values()],
        };
    }
    async loadInventoryAlertAnalyticsWindow(query) {
        const generatedAt = new Date();
        const periodDays = this.normalizePeriodDays(query.days);
        const windowStartedAt = this.buildWindowStart(generatedAt, periodDays);
        const notifications = await this.prisma.notification.findMany({
            where: {
                type: client_1.NotificationType.SYSTEM_ALERT,
                createdAt: {
                    gte: windowStartedAt,
                },
            },
            select: inventoryAlertReportNotificationSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
        const alerts = notifications
            .map((notification) => this.toResolvedInventoryAlert(notification))
            .filter((alert) => alert !== null)
            .filter((alert) => {
            if (query.branchId !== undefined &&
                query.branchId.trim().length > 0 &&
                alert.metadata.branchId !== query.branchId.trim()) {
                return false;
            }
            if (query.merchantUserId !== undefined &&
                query.merchantUserId.trim().length > 0 &&
                alert.merchantUserId !== query.merchantUserId.trim()) {
                return false;
            }
            return true;
        });
        const notificationIds = alerts.map((alert) => alert.notificationId);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(notificationIds);
        const followUpLogs = await this.auditService.listInventoryAlertFollowUpLogs(notificationIds);
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        const followUpLogsByNotificationId = this.buildFollowUpLogMap(followUpLogs);
        return {
            generatedAt,
            periodDays,
            windowStartedAt,
            windowEndedAt: generatedAt,
            alerts: alerts.map((alert) => ({
                ...alert,
                status: this.resolveInventoryAlertStatus(latestLifecycleByNotificationId.get(alert.notificationId) ?? null),
                followUpLogs: followUpLogsByNotificationId.get(alert.notificationId) ?? [],
            })),
            lifecycleLogs,
            followUpLogs,
        };
    }
    toResolvedInventoryAlert(notification) {
        const metadata = (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification);
        if (metadata === null) {
            return null;
        }
        return {
            notificationId: notification.id,
            merchantUserId: notification.userId,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            metadata,
            deliveries: notification.deliveries,
        };
    }
    buildLatestLifecycleLogMap(logs) {
        const latestLifecycleByNotificationId = new Map();
        for (const lifecycleLog of logs) {
            if (!latestLifecycleByNotificationId.has(lifecycleLog.resourceId)) {
                latestLifecycleByNotificationId.set(lifecycleLog.resourceId, lifecycleLog);
            }
        }
        return latestLifecycleByNotificationId;
    }
    buildFollowUpLogMap(logs) {
        const followUpLogsByNotificationId = new Map();
        for (const followUpLog of logs) {
            const list = followUpLogsByNotificationId.get(followUpLog.resourceId) ?? [];
            list.push(followUpLog);
            followUpLogsByNotificationId.set(followUpLog.resourceId, list);
        }
        return followUpLogsByNotificationId;
    }
    resolveInventoryAlertStatus(lifecycleLog) {
        switch (lifecycleLog?.action) {
            case inventoryAlertDismissalAction:
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED;
            case inventoryAlertResolutionAction:
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED;
            case inventoryAlertAcknowledgementAction:
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.ACKNOWLEDGED;
            default:
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN;
        }
    }
    buildWindowStart(now, days) {
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        start.setUTCDate(start.getUTCDate() - (days - 1));
        return start;
    }
    normalizePeriodDays(days) {
        if (days === undefined) {
            return 7;
        }
        return Math.min(Math.max(days, 1), list_admin_inventory_alert_report_query_dto_1.adminInventoryAlertReportMaxDays);
    }
    toUtcDateKey(value) {
        return value.toISOString().slice(0, 10);
    }
    assertAdmin(currentUser) {
        if (currentUser.role === client_1.UserRole.ADMIN) {
            return;
        }
        throw new app_exception_1.AppException('You are not allowed to read administrative reports.', common_1.HttpStatus.FORBIDDEN, {
            code: error_codes_1.ErrorCodes.forbidden,
        });
    }
};
exports.AdminReportsService = AdminReportsService;
exports.AdminReportsService = AdminReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminReportsService);
//# sourceMappingURL=admin-reports.service.js.map