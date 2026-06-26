import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BulkMarkInventoryAlertsReadDto } from '../dto/bulk-mark-inventory-alerts-read.dto';
import { BulkMarkInventoryAlertsReadResponseDto } from '../dto/bulk-mark-inventory-alerts-read-response.dto';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';
import { MerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { UpdateMerchantInventoryAlertPreferenceDto } from '../dto/update-merchant-inventory-alert-preference.dto';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationCenterPageEntity } from '../entities/notification-center-page.entity';
import { NotificationContractEntity } from '../entities/notification-contract.entity';
import { NotificationListPresetEntity } from '../entities/notification-list-preset.entity';
import { NotificationUnreadCountEntity } from '../entities/notification-unread-count.entity';
import { NotificationUnreadFacetsEntity } from '../entities/notification-unread-facets.entity';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationsService } from './notifications.service';
export declare class NotificationsRestService {
    private readonly notificationsService;
    private readonly notificationPreferencesService;
    constructor(notificationsService: NotificationsService, notificationPreferencesService: NotificationPreferencesService);
    listCurrentUserNotifications(currentUser: AuthenticatedUserEntity, query: ListNotificationsQueryDto): Promise<NotificationCenterEntity[]>;
    listCurrentUserNotificationPage(currentUser: AuthenticatedUserEntity, query: ListNotificationsQueryDto): Promise<NotificationCenterPageEntity>;
    getCurrentUserUnreadCount(currentUser: AuthenticatedUserEntity): Promise<NotificationUnreadCountEntity>;
    getCurrentUserUnreadFacets(currentUser: AuthenticatedUserEntity): Promise<NotificationUnreadFacetsEntity>;
    listCurrentUserNotificationPresets(currentUser: AuthenticatedUserEntity): Promise<NotificationListPresetEntity[]>;
    getCurrentUserNotificationContract(): NotificationContractEntity;
    markCurrentUserNotificationRead(currentUser: AuthenticatedUserEntity, notificationId: string): Promise<NotificationCenterEntity>;
    bulkMarkCurrentUserInventoryAlertsRead(currentUser: AuthenticatedUserEntity, payload: BulkMarkInventoryAlertsReadDto): Promise<BulkMarkInventoryAlertsReadResponseDto>;
    getCurrentMerchantInventoryAlertPreference(currentUser: AuthenticatedUserEntity): Promise<MerchantInventoryAlertPreferenceDto>;
    updateCurrentMerchantInventoryAlertPreference(currentUser: AuthenticatedUserEntity, payload: UpdateMerchantInventoryAlertPreferenceDto): Promise<MerchantInventoryAlertPreferenceDto>;
}
