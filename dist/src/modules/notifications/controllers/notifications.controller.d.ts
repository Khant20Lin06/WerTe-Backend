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
import { NotificationsRestService } from '../services/notifications-rest.service';
export declare class NotificationsController {
    private readonly notificationsRestService;
    constructor(notificationsRestService: NotificationsRestService);
    list(currentUser: AuthenticatedUserEntity, query: ListNotificationsQueryDto): Promise<NotificationCenterEntity[]>;
    listPage(currentUser: AuthenticatedUserEntity, query: ListNotificationsQueryDto): Promise<NotificationCenterPageEntity>;
    unreadCount(currentUser: AuthenticatedUserEntity): Promise<NotificationUnreadCountEntity>;
    unreadFacets(currentUser: AuthenticatedUserEntity): Promise<NotificationUnreadFacetsEntity>;
    presets(currentUser: AuthenticatedUserEntity): Promise<NotificationListPresetEntity[]>;
    contract(): NotificationContractEntity;
    inventoryAlertPreferences(currentUser: AuthenticatedUserEntity): Promise<MerchantInventoryAlertPreferenceDto>;
    updateInventoryAlertPreferences(currentUser: AuthenticatedUserEntity, payload: UpdateMerchantInventoryAlertPreferenceDto): Promise<MerchantInventoryAlertPreferenceDto>;
    bulkMarkInventoryAlertsRead(currentUser: AuthenticatedUserEntity, payload: BulkMarkInventoryAlertsReadDto): Promise<BulkMarkInventoryAlertsReadResponseDto>;
    markRead(currentUser: AuthenticatedUserEntity, notificationId: string): Promise<NotificationCenterEntity>;
}
