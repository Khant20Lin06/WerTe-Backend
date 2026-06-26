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
exports.NotificationsService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const audit_service_1 = require("../../audit/services/audit.service");
const admin_inventory_alert_dto_1 = require("../dto/admin-inventory-alert.dto");
const notification_contract_constants_1 = require("../constants/notification-contract.constants");
const admin_inventory_alert_notification_entity_1 = require("../entities/admin-inventory-alert-notification.entity");
const notification_contract_entity_1 = require("../entities/notification-contract.entity");
const notification_center_entity_1 = require("../entities/notification-center.entity");
const notification_center_page_entity_1 = require("../entities/notification-center-page.entity");
const notifications_repository_1 = require("../repositories/notifications.repository");
const notification_delivery_service_1 = require("./notification-delivery.service");
let NotificationsService = class NotificationsService {
    constructor(notificationsRepository, auditService, notificationDeliveryService) {
        this.notificationsRepository = notificationsRepository;
        this.auditService = auditService;
        this.notificationDeliveryService = notificationDeliveryService;
    }
    async listUserNotifications(userId, query = {}) {
        const page = await this.listUserNotificationPage(userId, query);
        return page.notifications;
    }
    async listUserNotificationPage(userId, query = {}) {
        const normalizedQuery = this.applyPreset(query);
        const limit = normalizedQuery.limit ?? notification_contract_constants_1.notificationPageDefaultLimit;
        const fetchLimit = this.resolveFetchLimit(limit, normalizedQuery);
        const records = await this.collectMatchingNotifications(userId, normalizedQuery, {
            fetchLimit,
            targetMatchCount: limit + 1,
        });
        const hasMore = records.length > limit;
        const notifications = hasMore ? records.slice(0, limit) : records;
        return (0, notification_center_page_entity_1.buildNotificationCenterPage)({
            nextCursor: hasMore
                ? notifications[notifications.length - 1]?.notificationId ?? null
                : null,
            hasMore,
            appliedPreset: normalizedQuery.preset ?? null,
            generatedAt: new Date().toISOString(),
            cacheTtlSeconds: notification_contract_constants_1.notificationPageCacheTtlSeconds,
            suggestedPollIntervalSeconds: notification_contract_constants_1.notificationPagePollIntervalSeconds,
            notifications,
        });
    }
    getUnreadCount(userId) {
        return this.notificationsRepository.countUnreadByUserId(userId);
    }
    async getUnreadFacets(userId) {
        const [totalUnreadCount, unreadInventoryAlerts] = await Promise.all([
            this.notificationsRepository.countUnreadByUserId(userId),
            this.notificationsRepository.listUnreadInventoryAlertsByUserId(userId),
        ]);
        const unreadInventoryNotifications = await this.buildNotificationCenterEntities(unreadInventoryAlerts);
        const inventoryAlerts = unreadInventoryNotifications
            .map((notification) => notification.inventoryAlert)
            .filter((inventoryAlert) => inventoryAlert !== null);
        return {
            totalUnreadCount,
            inventoryAlertUnreadCount: inventoryAlerts.length,
            unreadAttentionAlertCount: inventoryAlerts.filter((alert) => alert.alertKind === admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION).length,
            unreadCompensationAlertCount: inventoryAlerts.filter((alert) => alert.alertKind === admin_inventory_alert_dto_1.AdminInventoryAlertKind.COMPENSATION).length,
            unreadOpenInventoryAlertCount: inventoryAlerts.filter((alert) => alert.status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN).length,
            unreadAcknowledgedInventoryAlertCount: inventoryAlerts.filter((alert) => alert.status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.ACKNOWLEDGED).length,
            unreadResolvedInventoryAlertCount: inventoryAlerts.filter((alert) => alert.status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED).length,
            unreadDismissedInventoryAlertCount: inventoryAlerts.filter((alert) => alert.status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED).length,
            unreadLowStockAlertCount: inventoryAlerts.filter((alert) => alert.attentionLevel === 'LOW_STOCK').length,
            unreadOutOfStockAlertCount: inventoryAlerts.filter((alert) => alert.attentionLevel === 'OUT_OF_STOCK').length,
        };
    }
    async listNotificationPresets(userId) {
        const facets = await this.getUnreadFacets(userId);
        return this.buildNotificationPresetsFromFacets(facets);
    }
    getNotificationContract() {
        return (0, notification_contract_entity_1.buildNotificationContractEntity)();
    }
    async bulkMarkInventoryAlertsRead(userId, payload) {
        const explicitNotificationIds = this.normalizeNotificationIds(payload.notificationIds);
        let notificationIdsToMark = [];
        let markedCount = 0;
        if (explicitNotificationIds.length > 0) {
            const inventoryAlerts = await this.notificationsRepository.findInventoryAlertsByIdsForUser(userId, explicitNotificationIds);
            const validInventoryAlerts = inventoryAlerts.filter((notification) => (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification) !== null);
            if (validInventoryAlerts.length !== explicitNotificationIds.length) {
                throw new app_exception_1.AppException('Inventory alert notification was not found.', common_1.HttpStatus.NOT_FOUND, {
                    code: error_codes_1.ErrorCodes.notFound,
                });
            }
            notificationIdsToMark = validInventoryAlerts.map((notification) => notification.id);
            markedCount = validInventoryAlerts.filter((notification) => notification.readAt === null).length;
        }
        else {
            if (payload.markAllMatching !== true) {
                throw new app_exception_1.AppException('Provide notificationIds or set markAllMatching to true.', common_1.HttpStatus.BAD_REQUEST, {
                    code: error_codes_1.ErrorCodes.badRequest,
                });
            }
            const matchingInventoryAlerts = await this.listUserNotificationPage(userId, {
                limit: payload.limit ?? 100,
                type: client_1.NotificationType.SYSTEM_ALERT,
                unreadOnly: true,
                keyword: payload.keyword,
                inventoryAlertKind: payload.inventoryAlertKind,
                inventoryAlertStatus: payload.inventoryAlertStatus,
                inventoryResourceType: payload.inventoryResourceType,
                inventoryAttentionLevel: payload.inventoryAttentionLevel,
                branchId: payload.branchId,
            });
            notificationIdsToMark = matchingInventoryAlerts.notifications
                .filter((notification) => notification.inventoryAlert !== null)
                .map((notification) => notification.notificationId);
            markedCount = notificationIdsToMark.length;
        }
        if (notificationIdsToMark.length === 0) {
            return {
                markedCount: 0,
                notifications: [],
            };
        }
        const updatedNotifications = await this.notificationsRepository.markManyRead(notificationIdsToMark, userId);
        const notificationEntities = await this.buildNotificationCenterEntities(updatedNotifications);
        if (markedCount > 0) {
            this.notificationDeliveryService.emitNotificationBulkRead(userId, {
                markedCount,
                notifications: notificationEntities,
            });
            await this.emitLiveUnreadState(userId);
        }
        return {
            markedCount,
            notifications: notificationEntities,
        };
    }
    async hasRecentMerchantInventoryAlert(input) {
        const notifications = await this.notificationsRepository.listRecentInventoryAlertsByUserIdSince(input.userId, input.since);
        const inventoryAlerts = notifications
            .map((notification) => ({
            notification,
            metadata: (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification),
        }))
            .filter((alert) => alert.metadata !== null);
        const matchingNotifications = inventoryAlerts.filter(({ metadata }) => {
            return (metadata.alertKind === 'ATTENTION' &&
                metadata.resourceType === input.resourceType &&
                metadata.resourceId === input.resourceId &&
                metadata.attentionLevel === input.attentionLevel);
        });
        if (matchingNotifications.length === 0) {
            return false;
        }
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(matchingNotifications.map(({ notification }) => notification.id));
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        return matchingNotifications.some(({ notification, metadata }) => {
            const status = this.resolveInventoryAlertStatus(latestLifecycleByNotificationId.get(notification.id) ?? null);
            if (status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED) {
                return false;
            }
            if (status === admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED &&
                this.hasLaterCompensationAlert(inventoryAlerts, metadata.resourceType, metadata.resourceId, notification.createdAt)) {
                return false;
            }
            return true;
        });
    }
    async createNotification(payload) {
        const notification = await this.notificationsRepository.create(payload);
        const entity = await this.buildNotificationEntity(notification);
        this.notificationDeliveryService.emitNotificationCreated(entity);
        await this.emitLiveUnreadState(entity.userId);
        return entity;
    }
    async markNotificationRead(userId, notificationId) {
        const notification = await this.notificationsRepository.markRead(notificationId, userId);
        if (notification === null) {
            return null;
        }
        const entity = await this.buildNotificationEntity(notification);
        this.notificationDeliveryService.emitNotificationRead(entity);
        await this.emitLiveUnreadState(userId);
        return entity;
    }
    createDeliveryAttempt(payload) {
        return this.notificationsRepository.createDeliveryAttempt(payload);
    }
    markQueuedPushDeliveriesSent(notificationId, providerMessageId) {
        return this.notificationsRepository.markQueuedPushDeliveriesSent(notificationId, providerMessageId);
    }
    markQueuedPushDeliveriesFailed(notificationId, failureCode, failureMessage) {
        return this.notificationsRepository.markQueuedPushDeliveriesFailed(notificationId, failureCode, failureMessage);
    }
    getPushNotificationDispatch(notificationId) {
        return this.notificationsRepository.findPushNotificationDispatchById(notificationId);
    }
    deletePushTokensByIds(userId, pushTokenIds) {
        return this.notificationsRepository.deletePushTokensByIds(userId, pushTokenIds);
    }
    async buildNotificationEntity(notification) {
        const [entity] = await this.buildNotificationCenterEntities([notification]);
        return entity;
    }
    buildNotificationPresetsFromFacets(facets) {
        return notification_contract_constants_1.notificationPresetOrder.map((presetKey, index) => this.buildPreset(presetKey, this.resolvePresetUnreadCount(presetKey, facets), index));
    }
    async emitLiveUnreadState(userId) {
        const facets = await this.getUnreadFacets(userId);
        this.notificationDeliveryService.emitUnreadCountUpdated(userId, {
            unreadCount: facets.totalUnreadCount,
        });
        this.notificationDeliveryService.emitUnreadFacetsUpdated(userId, facets);
        this.notificationDeliveryService.emitNotificationPresetsUpdated(userId, this.buildNotificationPresetsFromFacets(facets));
    }
    async collectMatchingNotifications(userId, query, input) {
        const matched = [];
        let cursor = query.cursor;
        let hasMore = true;
        while (hasMore && matched.length < input.targetMatchCount) {
            const page = await this.notificationsRepository.listPageByUserId({
                userId,
                limit: input.fetchLimit,
                type: query.type ??
                    (this.hasInventoryAlertFilters(query)
                        ? client_1.NotificationType.SYSTEM_ALERT
                        : undefined),
                unreadOnly: query.unreadOnly ?? false,
                cursor,
            });
            const notifications = await this.buildNotificationCenterEntities(page.records);
            matched.push(...notifications.filter((notification) => this.matchesQuery(notification, query)));
            hasMore = page.hasMore;
            cursor = page.nextCursor ?? undefined;
        }
        return matched;
    }
    async buildNotificationCenterEntities(notifications) {
        const inventoryAlertCandidates = notifications
            .map((notification) => ({
            notificationId: notification.id,
            metadata: (0, admin_inventory_alert_notification_entity_1.readAdminInventoryAlertMetadata)(notification),
        }))
            .filter((candidate) => candidate.metadata !== null);
        const inventoryAlertNotificationIds = inventoryAlertCandidates.map(({ notificationId }) => notificationId);
        const acknowledgements = await this.auditService.listInventoryAlertAcknowledgementLogs(inventoryAlertNotificationIds);
        const latestAcknowledgementByNotificationId = this.buildLatestLifecycleLogMap(acknowledgements);
        const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(inventoryAlertNotificationIds);
        const latestLifecycleByNotificationId = this.buildLatestLifecycleLogMap(lifecycleLogs);
        const inventoryAlertMetadataByNotificationId = new Map(inventoryAlertCandidates.map((candidate) => [
            candidate.notificationId,
            candidate.metadata,
        ]));
        return notifications.map((notification) => (0, notification_center_entity_1.buildNotificationCenterEntity)(notification, this.buildInventoryAlertEntity(inventoryAlertMetadataByNotificationId.get(notification.id) ?? null, latestAcknowledgementByNotificationId.get(notification.id) ?? null, latestLifecycleByNotificationId.get(notification.id) ?? null)));
    }
    applyPreset(query) {
        if (query.preset === undefined || query.preset === 'ALL') {
            return query;
        }
        const presetDefaults = {};
        switch (query.preset) {
            case 'UNREAD':
                presetDefaults.unreadOnly = true;
                break;
            case 'INVENTORY_OPEN':
                presetDefaults.type = client_1.NotificationType.SYSTEM_ALERT;
                presetDefaults.inventoryAlertKind = 'ATTENTION';
                presetDefaults.inventoryAlertStatus = 'OPEN';
                break;
            case 'INVENTORY_RESOLVED':
                presetDefaults.type = client_1.NotificationType.SYSTEM_ALERT;
                presetDefaults.inventoryAlertStatus = 'RESOLVED';
                break;
            case 'INVENTORY_COMPENSATION':
                presetDefaults.type = client_1.NotificationType.SYSTEM_ALERT;
                presetDefaults.inventoryAlertKind = 'COMPENSATION';
                break;
            case 'INVENTORY_ATTENTION':
                presetDefaults.type = client_1.NotificationType.SYSTEM_ALERT;
                presetDefaults.inventoryAlertKind = 'ATTENTION';
                break;
            case 'INVENTORY_LOW_STOCK':
                presetDefaults.type = client_1.NotificationType.SYSTEM_ALERT;
                presetDefaults.inventoryAlertKind = 'ATTENTION';
                presetDefaults.inventoryAttentionLevel = 'LOW_STOCK';
                break;
            case 'INVENTORY_OUT_OF_STOCK':
                presetDefaults.type = client_1.NotificationType.SYSTEM_ALERT;
                presetDefaults.inventoryAlertKind = 'ATTENTION';
                presetDefaults.inventoryAttentionLevel = 'OUT_OF_STOCK';
                break;
            default:
                break;
        }
        return {
            ...presetDefaults,
            ...query,
            preset: query.preset,
        };
    }
    resolveFetchLimit(limit, query) {
        if (this.hasInventoryAlertFilters(query) ||
            (query.keyword !== undefined && query.keyword.trim().length > 0) ||
            query.preset !== undefined) {
            return Math.min(Math.max(limit * 5, 100), 500);
        }
        return limit;
    }
    hasInventoryAlertFilters(query) {
        return ((query.inventoryAlertKind !== undefined &&
            query.inventoryAlertKind !== 'ALL') ||
            (query.inventoryAlertStatus !== undefined &&
                query.inventoryAlertStatus !== 'ALL') ||
            (query.inventoryResourceType !== undefined &&
                query.inventoryResourceType !== 'ALL') ||
            (query.inventoryAttentionLevel !== undefined &&
                query.inventoryAttentionLevel !== 'ALL') ||
            (query.branchId !== undefined && query.branchId.trim().length > 0));
    }
    matchesQuery(notification, query) {
        const inventoryAlert = notification.inventoryAlert;
        if (this.hasInventoryAlertFilters(query) && inventoryAlert === null) {
            return false;
        }
        if (query.inventoryAlertKind !== undefined &&
            query.inventoryAlertKind !== 'ALL' &&
            inventoryAlert?.alertKind !== query.inventoryAlertKind) {
            return false;
        }
        if (query.inventoryAlertStatus !== undefined &&
            query.inventoryAlertStatus !== 'ALL' &&
            inventoryAlert?.status !== query.inventoryAlertStatus) {
            return false;
        }
        if (query.inventoryResourceType !== undefined &&
            query.inventoryResourceType !== 'ALL' &&
            inventoryAlert?.resourceType !== query.inventoryResourceType) {
            return false;
        }
        if (query.inventoryAttentionLevel !== undefined &&
            query.inventoryAttentionLevel !== 'ALL' &&
            inventoryAlert?.attentionLevel !== query.inventoryAttentionLevel) {
            return false;
        }
        if (query.branchId !== undefined && query.branchId.trim().length > 0) {
            if (inventoryAlert?.branchId !== query.branchId.trim()) {
                return false;
            }
        }
        if (query.keyword !== undefined && query.keyword.trim().length > 0) {
            const keyword = query.keyword.trim().toLowerCase();
            const haystacks = [
                notification.title,
                notification.body,
                notification.orderCode,
                notification.orderStatus,
                notification.conversationType,
                notification.messageType,
                inventoryAlert?.branchName,
                inventoryAlert?.resourceLabel,
                inventoryAlert?.menuItemName,
                inventoryAlert?.orderCode,
                inventoryAlert?.reasonCode,
                inventoryAlert?.attentionLevel,
                inventoryAlert?.alertKind,
                inventoryAlert?.status,
            ]
                .filter((value) => value !== null)
                .map((value) => value.toLowerCase());
            if (!haystacks.some((value) => value.includes(keyword))) {
                return false;
            }
        }
        return true;
    }
    buildInventoryAlertEntity(metadata, acknowledgement, lifecycleLog) {
        if (metadata === null) {
            return null;
        }
        return {
            alertKind: metadata.alertKind === 'COMPENSATION'
                ? admin_inventory_alert_dto_1.AdminInventoryAlertKind.COMPENSATION
                : admin_inventory_alert_dto_1.AdminInventoryAlertKind.ATTENTION,
            status: this.resolveInventoryAlertStatus(lifecycleLog),
            branchId: metadata.branchId,
            branchName: metadata.branchName,
            resourceType: metadata.resourceType,
            resourceId: metadata.resourceId,
            resourceLabel: metadata.resourceLabel,
            menuItemName: metadata.menuItemName,
            attentionLevel: metadata.attentionLevel,
            stockQuantity: metadata.stockQuantity,
            lowStockThreshold: metadata.lowStockThreshold,
            restoredQuantity: metadata.restoredQuantity,
            orderId: metadata.orderId,
            orderCode: metadata.orderCode,
            reasonCode: metadata.reasonCode,
            acknowledgementNote: this.readMetadataString(acknowledgement?.metadata, 'note'),
            acknowledgedAt: acknowledgement?.createdAt ?? null,
            statusNote: this.readMetadataString(lifecycleLog?.metadata, 'note'),
            statusChangedAt: lifecycleLog?.createdAt ?? null,
        };
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
    resolveInventoryAlertStatus(lifecycleLog) {
        switch (lifecycleLog?.action) {
            case 'inventory_alerts.dismissed':
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.DISMISSED;
            case 'inventory_alerts.resolved':
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.RESOLVED;
            case 'inventory_alerts.acknowledged':
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.ACKNOWLEDGED;
            default:
                return admin_inventory_alert_dto_1.AdminInventoryAlertStatus.OPEN;
        }
    }
    hasLaterCompensationAlert(inventoryAlerts, resourceType, resourceId, afterCreatedAt) {
        return inventoryAlerts.some(({ notification, metadata }) => metadata.alertKind === 'COMPENSATION' &&
            metadata.resourceType === resourceType &&
            metadata.resourceId === resourceId &&
            notification.createdAt > afterCreatedAt);
    }
    buildPreset(key, unreadCount, sortOrder) {
        const query = this.applyPreset({
            preset: key,
        });
        return {
            key,
            label: notification_contract_constants_1.notificationPresetLabels[key],
            sortOrder,
            isDefault: key === 'ALL',
            cacheTtlSeconds: notification_contract_constants_1.notificationPresetCacheTtlSeconds,
            unreadCount,
            query: {
                preset: key,
                unreadOnly: query.unreadOnly ?? null,
                type: query.type ?? null,
                inventoryAlertKind: query.inventoryAlertKind ?? null,
                inventoryAlertStatus: query.inventoryAlertStatus ?? null,
                inventoryResourceType: query.inventoryResourceType ?? null,
                inventoryAttentionLevel: query.inventoryAttentionLevel ?? null,
                branchId: query.branchId ?? null,
            },
        };
    }
    resolvePresetUnreadCount(preset, facets) {
        switch (preset) {
            case 'ALL':
            case 'UNREAD':
                return facets.totalUnreadCount;
            case 'INVENTORY_OPEN':
                return facets.unreadOpenInventoryAlertCount;
            case 'INVENTORY_RESOLVED':
                return facets.unreadResolvedInventoryAlertCount;
            case 'INVENTORY_COMPENSATION':
                return facets.unreadCompensationAlertCount;
            case 'INVENTORY_ATTENTION':
                return facets.unreadAttentionAlertCount;
            case 'INVENTORY_LOW_STOCK':
                return facets.unreadLowStockAlertCount;
            case 'INVENTORY_OUT_OF_STOCK':
                return facets.unreadOutOfStockAlertCount;
            default:
                return facets.totalUnreadCount;
        }
    }
    readMetadataString(metadata, key) {
        if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const value = metadata[key];
        return typeof value === 'string' && value.trim().length > 0 ? value : null;
    }
    normalizeNotificationIds(notificationIds) {
        if (notificationIds === undefined) {
            return [];
        }
        const normalizedIds = notificationIds
            .map((notificationId) => notificationId.trim())
            .filter((notificationId) => notificationId.length > 0);
        return [...new Set(normalizedIds)];
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        audit_service_1.AuditService,
        notification_delivery_service_1.NotificationDeliveryService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map