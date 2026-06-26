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
exports.AdminInventoryAlertsService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const audit_service_1 = require("../../audit/services/audit.service");
const admin_inventory_alert_dto_1 = require("../dto/admin-inventory-alert.dto");
const admin_inventory_alert_notification_entity_1 = require("../entities/admin-inventory-alert-notification.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
const inventoryAlertAcknowledgementAction = 'inventory_alerts.acknowledged';
const inventoryAlertResolutionAction = 'inventory_alerts.resolved';
const inventoryAlertDismissalAction = 'inventory_alerts.dismissed';
let AdminInventoryAlertsService = class AdminInventoryAlertsService {
    constructor(notificationsRepository, auditService) {
        this.notificationsRepository = notificationsRepository;
        this.auditService = auditService;
    }
    async listInventoryAlerts(currentUser, query) {
        this.assertAdmin(currentUser);
        const limit = query.limit ?? 20;
        const fetchLimit = Math.min(Math.max(limit * 4, 100), 200);
        const notifications = await this.notificationsRepository.listRecentInventoryAlerts(fetchLimit);
        const inventoryAlerts = notifications
            .map((notification) => ({
            notification,
            metadata: (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification),
        }))
            .filter((candidate) => candidate.metadata !== null);
        const acknowledgements = await this.auditService.listInventoryAlertAcknowledgementLogs(inventoryAlerts.map(({ notification }) => notification.id));
        const latestAcknowledgementByNotificationId = this.buildLatestLifecycleLogMap(acknowledgements);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(inventoryAlerts.map(({ notification }) => notification.id));
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        return inventoryAlerts
            .map(({ notification, metadata }) => this.toAdminInventoryAlertDto(notification, metadata, latestAcknowledgementByNotificationId.get(notification.id) ?? null, latestLifecycleByNotificationId.get(notification.id) ?? null))
            .filter((alert) => this.matchesQuery(alert, query))
            .slice(0, limit);
    }
    async acknowledgeInventoryAlert(currentUser, notificationId, payload) {
        this.assertAdmin(currentUser);
        const [resolvedAlert] = await this.findResolvedInventoryAlertsByIds([
            notificationId,
        ]);
        const acknowledgements = await this.auditService.listInventoryAlertAcknowledgementLogs([
            resolvedAlert.notification.id,
        ]);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs([
            resolvedAlert.notification.id,
        ]);
        const currentLifecycleLog = lifecycleLogs[0] ?? null;
        const currentStatus = this.resolveInventoryAlertStatus(currentLifecycleLog);
        if (currentStatus === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED ||
            currentStatus === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED) {
            return this.toAdminInventoryAlertDto(resolvedAlert.notification, resolvedAlert.metadata, acknowledgements[0] ?? null, currentLifecycleLog);
        }
        const acknowledgement = acknowledgements[0] ??
            (await this.logInventoryAlertAcknowledgement(currentUser, resolvedAlert.notification, resolvedAlert.metadata, payload.note));
        return this.toAdminInventoryAlertDto(resolvedAlert.notification, resolvedAlert.metadata, acknowledgement, acknowledgement);
    }
    async resolveInventoryAlert(currentUser, notificationId, payload) {
        this.assertAdmin(currentUser);
        const [resolvedAlert] = await this.findResolvedInventoryAlertsByIds([
            notificationId,
        ]);
        const acknowledgements = await this.auditService.listInventoryAlertAcknowledgementLogs([
            resolvedAlert.notification.id,
        ]);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs([
            resolvedAlert.notification.id,
        ]);
        const currentLifecycleLog = lifecycleLogs[0] ?? null;
        const currentStatus = this.resolveInventoryAlertStatus(currentLifecycleLog);
        if (currentStatus === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED) {
            return this.toAdminInventoryAlertDto(resolvedAlert.notification, resolvedAlert.metadata, acknowledgements[0] ?? null, currentLifecycleLog);
        }
        const lifecycleLog = currentStatus === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED
            ? currentLifecycleLog
            : await this.logInventoryAlertLifecycleAction(currentUser, resolvedAlert.notification, resolvedAlert.metadata, inventoryAlertResolutionAction, payload.note);
        return this.toAdminInventoryAlertDto(resolvedAlert.notification, resolvedAlert.metadata, acknowledgements[0] ?? null, lifecycleLog);
    }
    async bulkAcknowledgeInventoryAlerts(currentUser, payload) {
        this.assertAdmin(currentUser);
        const notificationIds = this.normalizeNotificationIds(payload.notificationIds);
        const resolvedAlerts = await this.findResolvedInventoryAlertsByIds(notificationIds);
        const alertByNotificationId = new Map(resolvedAlerts.map((resolvedAlert) => [
            resolvedAlert.notification.id,
            resolvedAlert,
        ]));
        const acknowledgements = await this.auditService.listInventoryAlertAcknowledgementLogs(notificationIds);
        const latestAcknowledgementByNotificationId = this.buildLatestLifecycleLogMap(acknowledgements);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(notificationIds);
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        let acknowledgedCount = 0;
        const alerts = [];
        for (const notificationId of notificationIds) {
            const resolvedAlert = alertByNotificationId.get(notificationId);
            if (resolvedAlert === undefined) {
                continue;
            }
            let acknowledgement = latestAcknowledgementByNotificationId.get(notificationId) ?? null;
            let lifecycleLog = latestLifecycleByNotificationId.get(notificationId) ?? null;
            const currentStatus = this.resolveInventoryAlertStatus(lifecycleLog);
            if (acknowledgement === null &&
                currentStatus !== admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED &&
                currentStatus !== admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED) {
                acknowledgement = await this.logInventoryAlertAcknowledgement(currentUser, resolvedAlert.notification, resolvedAlert.metadata, payload.note);
                latestAcknowledgementByNotificationId.set(notificationId, acknowledgement);
                lifecycleLog = acknowledgement;
                latestLifecycleByNotificationId.set(notificationId, acknowledgement);
                acknowledgedCount += 1;
            }
            alerts.push(this.toAdminInventoryAlertDto(resolvedAlert.notification, resolvedAlert.metadata, acknowledgement, lifecycleLog));
        }
        return {
            acknowledgedCount,
            alerts,
        };
    }
    async bulkDismissInventoryAlerts(currentUser, payload) {
        this.assertAdmin(currentUser);
        const notificationIds = this.normalizeNotificationIds(payload.notificationIds);
        const resolvedAlerts = await this.findResolvedInventoryAlertsByIds(notificationIds);
        const alertByNotificationId = new Map(resolvedAlerts.map((resolvedAlert) => [
            resolvedAlert.notification.id,
            resolvedAlert,
        ]));
        const acknowledgements = await this.auditService.listInventoryAlertAcknowledgementLogs(notificationIds);
        const latestAcknowledgementByNotificationId = this.buildLatestLifecycleLogMap(acknowledgements);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(notificationIds);
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        let dismissedCount = 0;
        const alerts = [];
        for (const notificationId of notificationIds) {
            const resolvedAlert = alertByNotificationId.get(notificationId);
            if (resolvedAlert === undefined) {
                continue;
            }
            const acknowledgement = latestAcknowledgementByNotificationId.get(notificationId) ?? null;
            let lifecycleLog = latestLifecycleByNotificationId.get(notificationId) ?? null;
            const currentStatus = this.resolveInventoryAlertStatus(lifecycleLog);
            if (currentStatus !== admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED) {
                lifecycleLog = await this.logInventoryAlertLifecycleAction(currentUser, resolvedAlert.notification, resolvedAlert.metadata, inventoryAlertDismissalAction, payload.note);
                latestLifecycleByNotificationId.set(notificationId, lifecycleLog);
                dismissedCount += 1;
            }
            alerts.push(this.toAdminInventoryAlertDto(resolvedAlert.notification, resolvedAlert.metadata, acknowledgement, lifecycleLog));
        }
        return {
            dismissedCount,
            alerts,
        };
    }
    assertAdmin(currentUser) {
        if (currentUser.role === client_1.UserRole.ADMIN) {
            return;
        }
        throw new app_exception_1.AppException('You are not allowed to manage inventory alerts.', common_1.HttpStatus.FORBIDDEN, {
            code: error_codes_1.ErrorCodes.forbidden,
        });
    }
    matchesQuery(alert, query) {
        if (query.branchId !== undefined && query.branchId.trim().length > 0) {
            if (alert.branchId !== query.branchId.trim()) {
                return false;
            }
        }
        if (query.status !== undefined && query.status !== 'ALL') {
            if (alert.status !== query.status) {
                return false;
            }
        }
        if (query.merchantUserId !== undefined &&
            query.merchantUserId.trim().length > 0 &&
            alert.merchantUserId !== query.merchantUserId.trim()) {
            return false;
        }
        if (query.alertKind !== undefined && query.alertKind !== 'ALL') {
            if (alert.alertKind !== query.alertKind) {
                return false;
            }
        }
        if (query.resourceType !== undefined && query.resourceType !== 'ALL') {
            if (alert.resourceType !== query.resourceType) {
                return false;
            }
        }
        if (query.attentionLevel !== undefined && query.attentionLevel !== 'ALL') {
            if (alert.attentionLevel !== query.attentionLevel) {
                return false;
            }
        }
        if (query.keyword !== undefined && query.keyword.trim().length > 0) {
            const keyword = query.keyword.trim().toLowerCase();
            const haystacks = [
                alert.title,
                alert.body,
                alert.resourceLabel,
                alert.menuItemName,
                alert.branchName,
                alert.orderCode,
                alert.merchantPhone,
                alert.reasonCode,
            ]
                .filter((value) => value !== null)
                .map((value) => value.toLowerCase());
            if (!haystacks.some((value) => value.includes(keyword))) {
                return false;
            }
        }
        return true;
    }
    async findResolvedInventoryAlertsByIds(notificationIds) {
        const notifications = await this.notificationsRepository.findInventoryAlertsByIds(notificationIds);
        const resolvedAlerts = notifications
            .map((notification) => ({
            notification,
            metadata: (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification),
        }))
            .filter((candidate) => candidate.metadata !== null);
        if (resolvedAlerts.length !== notificationIds.length) {
            throw new app_exception_1.AppException('Inventory alert was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return resolvedAlerts;
    }
    buildLatestLifecycleLogMap(logs) {
        const latestAcknowledgementByNotificationId = new Map();
        for (const acknowledgement of logs) {
            if (!latestAcknowledgementByNotificationId.has(acknowledgement.resourceId)) {
                latestAcknowledgementByNotificationId.set(acknowledgement.resourceId, acknowledgement);
            }
        }
        return latestAcknowledgementByNotificationId;
    }
    async logInventoryAlertLifecycleAction(currentUser, notification, metadata, action, note) {
        return this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action,
            resourceType: client_1.AuditResourceType.NOTIFICATION,
            resourceId: notification.id,
            resourceLabel: notification.title,
            targetUserId: notification.user.id,
            branchId: metadata.branchId,
            metadataJson: {
                note: this.normalizeOptionalString(note),
                notificationType: client_1.NotificationType.SYSTEM_ALERT,
                alertKind: metadata.alertKind,
                attentionLevel: metadata.attentionLevel,
                resourceType: metadata.resourceType,
                resourceId: metadata.resourceId,
                resourceLabel: metadata.resourceLabel,
                restoredQuantity: metadata.restoredQuantity,
                orderId: metadata.orderId,
                orderCode: metadata.orderCode,
                reasonCode: metadata.reasonCode,
            },
        });
    }
    async logInventoryAlertAcknowledgement(currentUser, notification, metadata, note) {
        return this.logInventoryAlertLifecycleAction(currentUser, notification, metadata, inventoryAlertAcknowledgementAction, note);
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
    toAdminInventoryAlertDto(notification, metadata, acknowledgement, lifecycleLog) {
        return {
            notificationId: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            navigationPath: notification.navigationPath ?? null,
            merchantUserId: notification.user.id,
            merchantRole: notification.user.role,
            merchantPhone: notification.user.phone,
            branchId: metadata.branchId,
            branchName: metadata.branchName,
            alertKind: metadata.alertKind === 'COMPENSATION'
                ? admin_inventory_alert_dto_1.AdminInventoryAlertKind.COMPENSATION
                : admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
            resourceType: metadata.resourceType,
            resourceId: metadata.resourceId,
            resourceLabel: metadata.resourceLabel,
            menuItemName: metadata.menuItemName,
            attentionLevel: metadata.attentionLevel,
            stockQuantity: metadata.stockQuantity,
            lowStockThreshold: metadata.lowStockThreshold,
            restoredQuantity: metadata.restoredQuantity,
            orderId: metadata.orderId ?? notification.orderId ?? null,
            orderCode: metadata.orderCode,
            reasonCode: metadata.reasonCode,
            merchantReadAt: notification.readAt?.toISOString() ?? null,
            status: this.resolveInventoryAlertStatus(lifecycleLog),
            acknowledgementNote: this.readMetadataString(acknowledgement?.metadata, 'note'),
            acknowledgedAt: acknowledgement?.createdAt ?? null,
            acknowledgedBy: acknowledgement?.actorUser === null || acknowledgement?.actorUser === undefined
                ? null
                : {
                    userId: acknowledgement.actorUser.userId,
                    role: acknowledgement.actorUser.role,
                    phone: acknowledgement.actorUser.phone,
                },
            statusNote: this.readMetadataString(lifecycleLog?.metadata, 'note'),
            statusChangedAt: lifecycleLog?.createdAt ?? null,
            statusChangedBy: lifecycleLog?.actorUser === null || lifecycleLog?.actorUser === undefined
                ? null
                : {
                    userId: lifecycleLog.actorUser.userId,
                    role: lifecycleLog.actorUser.role,
                    phone: lifecycleLog.actorUser.phone,
                },
            createdAt: notification.createdAt.toISOString(),
        };
    }
    readMetadataString(metadata, key) {
        if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const value = metadata[key];
        return typeof value === 'string' && value.trim().length > 0 ? value : null;
    }
    normalizeOptionalString(value) {
        if (value === undefined) {
            return null;
        }
        const normalized = value.trim();
        return normalized.length === 0 ? null : normalized;
    }
    normalizeNotificationIds(notificationIds) {
        const normalizedIds = notificationIds
            .map((notificationId) => notificationId.trim())
            .filter((notificationId) => notificationId.length > 0);
        return [...new Set(normalizedIds)];
    }
};
exports.AdminInventoryAlertsService = AdminInventoryAlertsService;
exports.AdminInventoryAlertsService = AdminInventoryAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        audit_service_1.AuditService])
], AdminInventoryAlertsService);
//# sourceMappingURL=admin-inventory-alerts.service.js.map