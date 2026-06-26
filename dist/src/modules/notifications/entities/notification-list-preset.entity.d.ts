export declare class NotificationListPresetQueryEntity {
    preset: string;
    unreadOnly: boolean | null;
    type: string | null;
    inventoryAlertKind: string | null;
    inventoryAlertStatus: string | null;
    inventoryResourceType: string | null;
    inventoryAttentionLevel: string | null;
    branchId: string | null;
}
export declare class NotificationListPresetEntity {
    key: string;
    label: string;
    sortOrder: number;
    isDefault: boolean;
    cacheTtlSeconds: number;
    unreadCount: number;
    query: NotificationListPresetQueryEntity;
}
