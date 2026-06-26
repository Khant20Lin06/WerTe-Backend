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
exports.NotificationContractEntity = exports.NotificationContractSamplesEntity = exports.NotificationContractPageDefaultsEntity = exports.NotificationContractQueryCapabilitiesEntity = exports.NotificationContractPresetDefinitionEntity = exports.NotificationContractRoutesEntity = exports.NotificationContractWebsocketEventsEntity = void 0;
exports.buildNotificationContractEntity = buildNotificationContractEntity;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const websocket_events_1 = require("../../../infrastructure/websocket/websocket-events");
const notification_contract_constants_1 = require("../constants/notification-contract.constants");
class NotificationContractWebsocketEventsEntity {
}
exports.NotificationContractWebsocketEventsEntity = NotificationContractWebsocketEventsEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/notifications' }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "namespace", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationCreated }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "notificationCreated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationRead }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "notificationRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationBulkRead }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "notificationBulkRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationUnreadCountUpdated }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "unreadCountUpdated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationUnreadFacetsUpdated }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "unreadFacetsUpdated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationPresetsUpdated }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "presetsUpdated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: websocket_events_1.WebsocketEvents.notificationPreferenceUpdated }),
    __metadata("design:type", String)
], NotificationContractWebsocketEventsEntity.prototype, "preferenceUpdated", void 0);
class NotificationContractRoutesEntity {
}
exports.NotificationContractRoutesEntity = NotificationContractRoutesEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.list }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "list", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.page }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.unreadCount }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.unreadFacets }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "unreadFacets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.presets }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "presets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.contract }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "contract", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.inventoryAlertPreferences }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "inventoryAlertPreferences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.bulkInventoryAlertMarkRead }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "bulkInventoryAlertMarkRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationContractRestRoutes.markReadTemplate }),
    __metadata("design:type", String)
], NotificationContractRoutesEntity.prototype, "markReadTemplate", void 0);
class NotificationContractPresetDefinitionEntity {
}
exports.NotificationContractPresetDefinitionEntity = NotificationContractPresetDefinitionEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ALL' }),
    __metadata("design:type", String)
], NotificationContractPresetDefinitionEntity.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'All notifications' }),
    __metadata("design:type", String)
], NotificationContractPresetDefinitionEntity.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0 }),
    __metadata("design:type", Number)
], NotificationContractPresetDefinitionEntity.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], NotificationContractPresetDefinitionEntity.prototype, "isDefault", void 0);
class NotificationContractQueryCapabilitiesEntity {
}
exports.NotificationContractQueryCapabilitiesEntity = NotificationContractQueryCapabilitiesEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_contract_constants_1.notificationPresetFilters, isArray: true }),
    __metadata("design:type", Array)
], NotificationContractQueryCapabilitiesEntity.prototype, "presets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_contract_constants_1.notificationInventoryAlertKindFilters, isArray: true }),
    __metadata("design:type", Array)
], NotificationContractQueryCapabilitiesEntity.prototype, "inventoryAlertKinds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_contract_constants_1.notificationInventoryAlertStatusFilters, isArray: true }),
    __metadata("design:type", Array)
], NotificationContractQueryCapabilitiesEntity.prototype, "inventoryAlertStatuses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_contract_constants_1.notificationInventoryResourceTypeFilters, isArray: true }),
    __metadata("design:type", Array)
], NotificationContractQueryCapabilitiesEntity.prototype, "inventoryResourceTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: notification_contract_constants_1.notificationInventoryAlertAttentionLevelFilters,
        isArray: true,
    }),
    __metadata("design:type", Array)
], NotificationContractQueryCapabilitiesEntity.prototype, "inventoryAttentionLevels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.NotificationType, isArray: true }),
    __metadata("design:type", Array)
], NotificationContractQueryCapabilitiesEntity.prototype, "notificationTypes", void 0);
class NotificationContractPageDefaultsEntity {
}
exports.NotificationContractPageDefaultsEntity = NotificationContractPageDefaultsEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationPageDefaultLimit }),
    __metadata("design:type", Number)
], NotificationContractPageDefaultsEntity.prototype, "defaultLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationPageMaxLimit }),
    __metadata("design:type", Number)
], NotificationContractPageDefaultsEntity.prototype, "maxLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationPageCacheTtlSeconds }),
    __metadata("design:type", Number)
], NotificationContractPageDefaultsEntity.prototype, "pageCacheTtlSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationPagePollIntervalSeconds }),
    __metadata("design:type", Number)
], NotificationContractPageDefaultsEntity.prototype, "suggestedPollIntervalSeconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: notification_contract_constants_1.notificationPresetCacheTtlSeconds }),
    __metadata("design:type", Number)
], NotificationContractPageDefaultsEntity.prototype, "presetCacheTtlSeconds", void 0);
class NotificationContractSamplesEntity {
}
exports.NotificationContractSamplesEntity = NotificationContractSamplesEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: notification_contract_constants_1.notificationContractQueryExamples.page,
    }),
    __metadata("design:type", Object)
], NotificationContractSamplesEntity.prototype, "pageQuery", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: notification_contract_constants_1.notificationContractQueryExamples.history,
    }),
    __metadata("design:type", Object)
], NotificationContractSamplesEntity.prototype, "historyQuery", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            unreadCount: 3,
        },
    }),
    __metadata("design:type", Object)
], NotificationContractSamplesEntity.prototype, "unreadCountPayload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            totalUnreadCount: 5,
            inventoryAlertUnreadCount: 3,
            unreadAttentionAlertCount: 2,
            unreadCompensationAlertCount: 1,
            unreadOpenInventoryAlertCount: 2,
            unreadAcknowledgedInventoryAlertCount: 0,
            unreadResolvedInventoryAlertCount: 1,
            unreadDismissedInventoryAlertCount: 0,
            unreadLowStockAlertCount: 1,
            unreadOutOfStockAlertCount: 1,
        },
    }),
    __metadata("design:type", Object)
], NotificationContractSamplesEntity.prototype, "unreadFacetsPayload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            userId: 'usr_merchant_1',
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
            inventoryAlertPushCurrentlyMuted: false,
            deliveryLanes: [
                {
                    channel: 'IN_APP',
                    enabled: true,
                    active: true,
                    suppressionReason: null,
                },
                {
                    channel: 'PUSH',
                    enabled: true,
                    active: true,
                    suppressionReason: null,
                },
            ],
            activeDeliveryChannels: ['IN_APP', 'PUSH'],
            inventoryAlertPushSuppressedReason: null,
        },
    }),
    __metadata("design:type", Object)
], NotificationContractSamplesEntity.prototype, "preferencePayload", void 0);
class NotificationContractEntity {
}
exports.NotificationContractEntity = NotificationContractEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'notification-contract.v1' }),
    __metadata("design:type", String)
], NotificationContractEntity.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationContractRoutesEntity }),
    __metadata("design:type", NotificationContractRoutesEntity)
], NotificationContractEntity.prototype, "restRoutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationContractWebsocketEventsEntity }),
    __metadata("design:type", NotificationContractWebsocketEventsEntity)
], NotificationContractEntity.prototype, "websocketEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationContractPageDefaultsEntity }),
    __metadata("design:type", NotificationContractPageDefaultsEntity)
], NotificationContractEntity.prototype, "pageDefaults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationContractQueryCapabilitiesEntity }),
    __metadata("design:type", NotificationContractQueryCapabilitiesEntity)
], NotificationContractEntity.prototype, "queryCapabilities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: NotificationContractPresetDefinitionEntity,
        isArray: true,
    }),
    __metadata("design:type", Array)
], NotificationContractEntity.prototype, "presets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationContractSamplesEntity }),
    __metadata("design:type", NotificationContractSamplesEntity)
], NotificationContractEntity.prototype, "samples", void 0);
function buildNotificationContractEntity() {
    return {
        version: 'notification-contract.v1',
        restRoutes: {
            ...notification_contract_constants_1.notificationContractRestRoutes,
        },
        websocketEvents: {
            namespace: '/notifications',
            notificationCreated: websocket_events_1.WebsocketEvents.notificationCreated,
            notificationRead: websocket_events_1.WebsocketEvents.notificationRead,
            notificationBulkRead: websocket_events_1.WebsocketEvents.notificationBulkRead,
            unreadCountUpdated: websocket_events_1.WebsocketEvents.notificationUnreadCountUpdated,
            unreadFacetsUpdated: websocket_events_1.WebsocketEvents.notificationUnreadFacetsUpdated,
            presetsUpdated: websocket_events_1.WebsocketEvents.notificationPresetsUpdated,
            preferenceUpdated: websocket_events_1.WebsocketEvents.notificationPreferenceUpdated,
        },
        pageDefaults: {
            defaultLimit: notification_contract_constants_1.notificationPageDefaultLimit,
            maxLimit: notification_contract_constants_1.notificationPageMaxLimit,
            pageCacheTtlSeconds: notification_contract_constants_1.notificationPageCacheTtlSeconds,
            suggestedPollIntervalSeconds: notification_contract_constants_1.notificationPagePollIntervalSeconds,
            presetCacheTtlSeconds: notification_contract_constants_1.notificationPresetCacheTtlSeconds,
        },
        queryCapabilities: {
            presets: [...notification_contract_constants_1.notificationPresetFilters],
            inventoryAlertKinds: [...notification_contract_constants_1.notificationInventoryAlertKindFilters],
            inventoryAlertStatuses: [...notification_contract_constants_1.notificationInventoryAlertStatusFilters],
            inventoryResourceTypes: [...notification_contract_constants_1.notificationInventoryResourceTypeFilters],
            inventoryAttentionLevels: [
                ...notification_contract_constants_1.notificationInventoryAlertAttentionLevelFilters,
            ],
            notificationTypes: Object.values(client_1.NotificationType),
        },
        presets: notification_contract_constants_1.notificationPresetOrder.map((key, index) => ({
            key,
            label: notification_contract_constants_1.notificationPresetLabels[key],
            sortOrder: index,
            isDefault: key === 'ALL',
        })),
        samples: {
            pageQuery: { ...notification_contract_constants_1.notificationContractQueryExamples.page },
            historyQuery: { ...notification_contract_constants_1.notificationContractQueryExamples.history },
            unreadCountPayload: {
                unreadCount: 3,
            },
            unreadFacetsPayload: {
                totalUnreadCount: 5,
                inventoryAlertUnreadCount: 3,
                unreadAttentionAlertCount: 2,
                unreadCompensationAlertCount: 1,
                unreadOpenInventoryAlertCount: 2,
                unreadAcknowledgedInventoryAlertCount: 0,
                unreadResolvedInventoryAlertCount: 1,
                unreadDismissedInventoryAlertCount: 0,
                unreadLowStockAlertCount: 1,
                unreadOutOfStockAlertCount: 1,
            },
            preferencePayload: {
                userId: 'usr_merchant_1',
                inventoryAlertPushEnabled: true,
                inventoryAlertQuietHoursEnabled: true,
                inventoryAlertQuietHoursStartLocalTime: '22:00',
                inventoryAlertQuietHoursEndLocalTime: '06:00',
                inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
                inventoryAlertPushCurrentlyMuted: false,
                deliveryLanes: [
                    {
                        channel: 'IN_APP',
                        enabled: true,
                        active: true,
                        suppressionReason: null,
                    },
                    {
                        channel: 'PUSH',
                        enabled: true,
                        active: true,
                        suppressionReason: null,
                    },
                ],
                activeDeliveryChannels: ['IN_APP', 'PUSH'],
                inventoryAlertPushSuppressedReason: null,
            },
        },
    };
}
//# sourceMappingURL=notification-contract.entity.js.map