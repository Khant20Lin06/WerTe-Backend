import { NotificationType } from '@prisma/client';
import type { NotificationInventoryAlertKindFilter, NotificationInventoryAlertStatusFilter, NotificationInventoryResourceTypeFilter, NotificationInventoryAttentionLevelFilter, NotificationPresetFilter } from '../constants/notification-contract.constants';
export type { NotificationInventoryAlertKindFilter, NotificationInventoryAlertStatusFilter, NotificationInventoryResourceTypeFilter, NotificationInventoryAttentionLevelFilter, NotificationPresetFilter, } from '../constants/notification-contract.constants';
export declare class ListNotificationsQueryDto {
    limit?: number;
    cursor?: string;
    type?: NotificationType;
    preset?: NotificationPresetFilter;
    unreadOnly?: boolean;
    keyword?: string;
    inventoryAlertKind?: NotificationInventoryAlertKindFilter;
    inventoryAlertStatus?: NotificationInventoryAlertStatusFilter;
    inventoryResourceType?: NotificationInventoryResourceTypeFilter;
    inventoryAttentionLevel?: NotificationInventoryAttentionLevelFilter;
    branchId?: string;
}
