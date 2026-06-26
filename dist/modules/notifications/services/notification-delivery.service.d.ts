import { Server } from 'socket.io';
import { MerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { NotificationListPresetEntity } from '../entities/notification-list-preset.entity';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationUnreadCountEntity } from '../entities/notification-unread-count.entity';
import { NotificationUnreadFacetsEntity } from '../entities/notification-unread-facets.entity';
export declare function buildNotificationUserRoom(userId: string): string;
export declare class NotificationDeliveryService {
    private server;
    attachServer(server: Server): void;
    emitNotificationCreated(notification: NotificationCenterEntity): void;
    emitNotificationRead(notification: NotificationCenterEntity): void;
    emitNotificationBulkRead(userId: string, payload: {
        markedCount: number;
        notifications: NotificationCenterEntity[];
    }): void;
    emitUnreadCountUpdated(userId: string, payload: NotificationUnreadCountEntity): void;
    emitUnreadFacetsUpdated(userId: string, payload: NotificationUnreadFacetsEntity): void;
    emitNotificationPresetsUpdated(userId: string, payload: NotificationListPresetEntity[]): void;
    emitNotificationPreferenceUpdated(userId: string, payload: MerchantInventoryAlertPreferenceDto): void;
}
