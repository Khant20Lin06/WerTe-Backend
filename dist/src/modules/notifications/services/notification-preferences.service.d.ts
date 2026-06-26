import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantAccountService } from '../../merchants/services/merchant-account.service';
import { MerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { UpdateMerchantInventoryAlertPreferenceDto } from '../dto/update-merchant-inventory-alert-preference.dto';
import { MerchantInventoryAlertPreferenceEntity } from '../entities/merchant-inventory-alert-preference.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationPreferenceScheduleService } from './notification-preference-schedule.service';
export declare class NotificationPreferencesService {
    private readonly notificationsRepository;
    private readonly merchantAccountService;
    private readonly auditService;
    private readonly notificationDeliveryService;
    private readonly notificationPreferenceScheduleService;
    constructor(notificationsRepository: NotificationsRepository, merchantAccountService: MerchantAccountService, auditService: AuditService, notificationDeliveryService: NotificationDeliveryService, notificationPreferenceScheduleService: NotificationPreferenceScheduleService);
    getCurrentMerchantInventoryAlertPreference(currentUser: AuthenticatedUserEntity): Promise<MerchantInventoryAlertPreferenceDto>;
    updateCurrentMerchantInventoryAlertPreference(currentUser: AuthenticatedUserEntity, payload: UpdateMerchantInventoryAlertPreferenceDto): Promise<MerchantInventoryAlertPreferenceDto>;
    shouldQueueMerchantInventoryAlertPush(userId: string, at?: Date): Promise<boolean>;
    getMerchantInventoryAlertPreferenceByUserId(userId: string): Promise<MerchantInventoryAlertPreferenceEntity>;
    private buildPreferenceDto;
    private mergePreferencePayload;
    private assertValidTimeZone;
}
