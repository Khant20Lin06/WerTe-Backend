import { NotificationInventoryAlertKindFilter, NotificationInventoryAlertStatusFilter, NotificationInventoryAttentionLevelFilter, NotificationInventoryResourceTypeFilter } from './list-notifications-query.dto';
export declare class BulkMarkInventoryAlertsReadDto {
    notificationIds?: string[];
    markAllMatching?: boolean;
    limit?: number;
    keyword?: string;
    inventoryAlertKind?: NotificationInventoryAlertKindFilter;
    inventoryAlertStatus?: NotificationInventoryAlertStatusFilter;
    inventoryResourceType?: NotificationInventoryResourceTypeFilter;
    inventoryAttentionLevel?: NotificationInventoryAttentionLevelFilter;
    branchId?: string;
}
