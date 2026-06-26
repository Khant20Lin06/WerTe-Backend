export declare const notificationInventoryAlertKindFilters: readonly ["ALL", "ATTENTION", "COMPENSATION"];
export declare const notificationInventoryAlertStatusFilters: readonly ["ALL", "OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"];
export declare const notificationInventoryResourceTypeFilters: readonly ["ALL", "MENU_ITEM", "ITEM_OPTION"];
export declare const notificationInventoryAlertAttentionLevelFilters: readonly ["ALL", "LOW_STOCK", "OUT_OF_STOCK"];
export declare const notificationPresetFilters: readonly ["ALL", "UNREAD", "INVENTORY_OPEN", "INVENTORY_RESOLVED", "INVENTORY_COMPENSATION", "INVENTORY_ATTENTION", "INVENTORY_LOW_STOCK", "INVENTORY_OUT_OF_STOCK"];
export type NotificationInventoryAlertKindFilter = (typeof notificationInventoryAlertKindFilters)[number];
export type NotificationInventoryAlertStatusFilter = (typeof notificationInventoryAlertStatusFilters)[number];
export type NotificationInventoryResourceTypeFilter = (typeof notificationInventoryResourceTypeFilters)[number];
export type NotificationInventoryAttentionLevelFilter = (typeof notificationInventoryAlertAttentionLevelFilters)[number];
export type NotificationPresetFilter = (typeof notificationPresetFilters)[number];
export declare const notificationPresetLabels: Record<NotificationPresetFilter, string>;
export declare const notificationPresetOrder: NotificationPresetFilter[];
export declare const notificationPageDefaultLimit = 20;
export declare const notificationPageMaxLimit = 100;
export declare const notificationPresetCacheTtlSeconds = 120;
export declare const notificationPageCacheTtlSeconds = 30;
export declare const notificationPagePollIntervalSeconds = 15;
export declare const notificationContractRestRoutes: {
    readonly list: "/notifications";
    readonly page: "/notifications/page";
    readonly unreadCount: "/notifications/unread-count";
    readonly unreadFacets: "/notifications/unread-facets";
    readonly presets: "/notifications/presets";
    readonly contract: "/notifications/contract";
    readonly inventoryAlertPreferences: "/notifications/inventory-alert-preferences";
    readonly bulkInventoryAlertMarkRead: "/notifications/inventory-alerts/mark-read";
    readonly markReadTemplate: "/notifications/:notificationId/read";
};
export declare const notificationContractQueryExamples: {
    readonly page: {
        readonly limit: 20;
        readonly preset: "INVENTORY_OPEN";
    };
    readonly history: {
        readonly type: "SYSTEM_ALERT";
        readonly inventoryAlertStatus: "RESOLVED";
        readonly inventoryAlertKind: "ATTENTION";
    };
};
