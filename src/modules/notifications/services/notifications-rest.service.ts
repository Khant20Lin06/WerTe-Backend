import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
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

@Injectable()
export class NotificationsRestService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  listCurrentUserNotifications(
    currentUser: AuthenticatedUserEntity,
    query: ListNotificationsQueryDto,
  ): Promise<NotificationCenterEntity[]> {
    return this.notificationsService.listUserNotifications(
      currentUser.userId,
      query,
    );
  }

  listCurrentUserNotificationPage(
    currentUser: AuthenticatedUserEntity,
    query: ListNotificationsQueryDto,
  ): Promise<NotificationCenterPageEntity> {
    return this.notificationsService.listUserNotificationPage(
      currentUser.userId,
      query,
    );
  }

  async getCurrentUserUnreadCount(
    currentUser: AuthenticatedUserEntity,
  ): Promise<NotificationUnreadCountEntity> {
    const unreadCount = await this.notificationsService.getUnreadCount(
      currentUser.userId,
    );

    return { unreadCount };
  }

  getCurrentUserUnreadFacets(
    currentUser: AuthenticatedUserEntity,
  ): Promise<NotificationUnreadFacetsEntity> {
    return this.notificationsService.getUnreadFacets(currentUser.userId);
  }

  listCurrentUserNotificationPresets(
    currentUser: AuthenticatedUserEntity,
  ): Promise<NotificationListPresetEntity[]> {
    return this.notificationsService.listNotificationPresets(currentUser.userId);
  }

  getCurrentUserNotificationContract(): NotificationContractEntity {
    return this.notificationsService.getNotificationContract();
  }

  async markCurrentUserNotificationRead(
    currentUser: AuthenticatedUserEntity,
    notificationId: string,
  ): Promise<NotificationCenterEntity> {
    const notification = await this.notificationsService.markNotificationRead(
      currentUser.userId,
      notificationId,
    );

    if (notification === null) {
      throw new AppException(
        'Notification was not found.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return notification;
  }

  bulkMarkCurrentUserInventoryAlertsRead(
    currentUser: AuthenticatedUserEntity,
    payload: BulkMarkInventoryAlertsReadDto,
  ): Promise<BulkMarkInventoryAlertsReadResponseDto> {
    return this.notificationsService.bulkMarkInventoryAlertsRead(
      currentUser.userId,
      payload,
    );
  }

  getCurrentMerchantInventoryAlertPreference(
    currentUser: AuthenticatedUserEntity,
  ): Promise<MerchantInventoryAlertPreferenceDto> {
    return this.notificationPreferencesService.getCurrentMerchantInventoryAlertPreference(
      currentUser,
    );
  }

  updateCurrentMerchantInventoryAlertPreference(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateMerchantInventoryAlertPreferenceDto,
  ): Promise<MerchantInventoryAlertPreferenceDto> {
    return this.notificationPreferencesService.updateCurrentMerchantInventoryAlertPreference(
      currentUser,
      payload,
    );
  }
}
