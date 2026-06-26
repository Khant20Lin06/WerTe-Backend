import { NotificationType } from '@prisma/client';
export declare class NotificationContractWebsocketEventsEntity {
    namespace: string;
    notificationCreated: string;
    notificationRead: string;
    notificationBulkRead: string;
    unreadCountUpdated: string;
    unreadFacetsUpdated: string;
    presetsUpdated: string;
    preferenceUpdated: string;
}
export declare class NotificationContractRoutesEntity {
    list: string;
    page: string;
    unreadCount: string;
    unreadFacets: string;
    presets: string;
    contract: string;
    inventoryAlertPreferences: string;
    bulkInventoryAlertMarkRead: string;
    markReadTemplate: string;
}
export declare class NotificationContractPresetDefinitionEntity {
    key: string;
    label: string;
    sortOrder: number;
    isDefault: boolean;
}
export declare class NotificationContractQueryCapabilitiesEntity {
    presets: string[];
    inventoryAlertKinds: string[];
    inventoryAlertStatuses: string[];
    inventoryResourceTypes: string[];
    inventoryAttentionLevels: string[];
    notificationTypes: NotificationType[];
}
export declare class NotificationContractPageDefaultsEntity {
    defaultLimit: number;
    maxLimit: number;
    pageCacheTtlSeconds: number;
    suggestedPollIntervalSeconds: number;
    presetCacheTtlSeconds: number;
}
export declare class NotificationContractSamplesEntity {
    pageQuery: Record<string, unknown>;
    historyQuery: Record<string, unknown>;
    unreadCountPayload: Record<string, unknown>;
    unreadFacetsPayload: Record<string, unknown>;
    preferencePayload: Record<string, unknown>;
}
export declare class NotificationContractEntity {
    version: string;
    restRoutes: NotificationContractRoutesEntity;
    websocketEvents: NotificationContractWebsocketEventsEntity;
    pageDefaults: NotificationContractPageDefaultsEntity;
    queryCapabilities: NotificationContractQueryCapabilitiesEntity;
    presets: NotificationContractPresetDefinitionEntity[];
    samples: NotificationContractSamplesEntity;
}
export declare function buildNotificationContractEntity(): NotificationContractEntity;
