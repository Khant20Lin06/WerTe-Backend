import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
} from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantAccountService } from '../../merchants/services/merchant-account.service';
import { MerchantInventoryAlertPreferenceDto, toMerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import { UpdateMerchantInventoryAlertPreferenceDto } from '../dto/update-merchant-inventory-alert-preference.dto';
import {
  buildMerchantInventoryAlertPreferenceEntity,
  MerchantInventoryAlertPreferenceEntity,
} from '../entities/merchant-inventory-alert-preference.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { isInventoryAlertPushMutedNow } from '../utils/notification-preference-time.util';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationPreferenceScheduleService } from './notification-preference-schedule.service';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly merchantAccountService: MerchantAccountService,
    private readonly auditService: AuditService,
    private readonly notificationDeliveryService: NotificationDeliveryService,
    private readonly notificationPreferenceScheduleService: NotificationPreferenceScheduleService,
  ) {}

  async getCurrentMerchantInventoryAlertPreference(
    currentUser: AuthenticatedUserEntity,
  ): Promise<MerchantInventoryAlertPreferenceDto> {
    await this.merchantAccountService.resolveOwnedMerchant(currentUser);

    return this.buildPreferenceDto(
      await this.getMerchantInventoryAlertPreferenceByUserId(currentUser.userId),
    );
  }

  async updateCurrentMerchantInventoryAlertPreference(
    currentUser: AuthenticatedUserEntity,
    payload: UpdateMerchantInventoryAlertPreferenceDto,
  ): Promise<MerchantInventoryAlertPreferenceDto> {
    await this.merchantAccountService.resolveOwnedMerchant(currentUser);

    const currentPreference =
      await this.getMerchantInventoryAlertPreferenceByUserId(currentUser.userId);
    const nextPreference = this.mergePreferencePayload(currentPreference, payload);
    const updatedPreference =
      await this.notificationsRepository.upsertNotificationPreferenceByUserId(
        currentUser.userId,
        {
          inventoryAlertPushEnabled: nextPreference.inventoryAlertPushEnabled,
          inventoryAlertQuietHoursEnabled:
            nextPreference.inventoryAlertQuietHoursEnabled,
          inventoryAlertQuietHoursStartLocalTime:
            nextPreference.inventoryAlertQuietHoursStartLocalTime,
          inventoryAlertQuietHoursEndLocalTime:
            nextPreference.inventoryAlertQuietHoursEndLocalTime,
          inventoryAlertQuietHoursTimezone:
            nextPreference.inventoryAlertQuietHoursTimezone,
        },
      );

    await this.auditService.logAction({
      actorType: AuditActorType.USER,
      actorUserId: currentUser.userId,
      actorRole: currentUser.role,
      actionSource: AuditActionSource.API,
      action: 'notification_preferences.updated',
      resourceType: AuditResourceType.USER,
      resourceId: currentUser.userId,
      resourceLabel: 'Merchant inventory alert preferences',
      targetUserId: currentUser.userId,
      metadataJson: {
        inventoryAlertPushEnabled:
          updatedPreference.inventoryAlertPushEnabled,
        inventoryAlertQuietHoursEnabled:
          updatedPreference.inventoryAlertQuietHoursEnabled,
        inventoryAlertQuietHoursStartLocalTime:
          updatedPreference.inventoryAlertQuietHoursStartLocalTime,
        inventoryAlertQuietHoursEndLocalTime:
          updatedPreference.inventoryAlertQuietHoursEndLocalTime,
        inventoryAlertQuietHoursTimezone:
          updatedPreference.inventoryAlertQuietHoursTimezone,
      },
    });

    const dto = this.buildPreferenceDto(
      buildMerchantInventoryAlertPreferenceEntity({
        userId: currentUser.userId,
        preference: updatedPreference,
      }),
    );
    this.notificationDeliveryService.emitNotificationPreferenceUpdated(
      currentUser.userId,
      dto,
    );
    await this.notificationPreferenceScheduleService.rescheduleUser(
      currentUser.userId,
    );

    return dto;
  }

  async shouldQueueMerchantInventoryAlertPush(
    userId: string,
    at = new Date(),
  ): Promise<boolean> {
    const preference =
      await this.getMerchantInventoryAlertPreferenceByUserId(userId);

    if (!preference.inventoryAlertPushEnabled) {
      return false;
    }

    return !isInventoryAlertPushMutedNow(preference, at);
  }

  async getMerchantInventoryAlertPreferenceByUserId(
    userId: string,
  ): Promise<MerchantInventoryAlertPreferenceEntity> {
    const preference =
      await this.notificationsRepository.findNotificationPreferenceByUserId(
        userId,
      );

    return buildMerchantInventoryAlertPreferenceEntity({
      userId,
      preference,
    });
  }

  private buildPreferenceDto(
    preference: MerchantInventoryAlertPreferenceEntity,
  ): MerchantInventoryAlertPreferenceDto {
    return toMerchantInventoryAlertPreferenceDto({
      preference,
      inventoryAlertPushCurrentlyMuted: isInventoryAlertPushMutedNow(preference),
    });
  }

  private mergePreferencePayload(
    currentPreference: MerchantInventoryAlertPreferenceEntity,
    payload: UpdateMerchantInventoryAlertPreferenceDto,
  ): MerchantInventoryAlertPreferenceEntity {
    const nextPreference: MerchantInventoryAlertPreferenceEntity = {
      userId: currentPreference.userId,
      inventoryAlertPushEnabled:
        payload.inventoryAlertPushEnabled ??
        currentPreference.inventoryAlertPushEnabled,
      inventoryAlertQuietHoursEnabled:
        payload.inventoryAlertQuietHoursEnabled ??
        currentPreference.inventoryAlertQuietHoursEnabled,
      inventoryAlertQuietHoursStartLocalTime:
        payload.inventoryAlertQuietHoursStartLocalTime ??
        currentPreference.inventoryAlertQuietHoursStartLocalTime,
      inventoryAlertQuietHoursEndLocalTime:
        payload.inventoryAlertQuietHoursEndLocalTime ??
        currentPreference.inventoryAlertQuietHoursEndLocalTime,
      inventoryAlertQuietHoursTimezone:
        payload.inventoryAlertQuietHoursTimezone ??
        currentPreference.inventoryAlertQuietHoursTimezone,
    };

    if (!nextPreference.inventoryAlertQuietHoursEnabled) {
      return {
        ...nextPreference,
        inventoryAlertQuietHoursStartLocalTime: null,
        inventoryAlertQuietHoursEndLocalTime: null,
        inventoryAlertQuietHoursTimezone: null,
      };
    }

    if (
      nextPreference.inventoryAlertQuietHoursStartLocalTime === null ||
      nextPreference.inventoryAlertQuietHoursEndLocalTime === null ||
      nextPreference.inventoryAlertQuietHoursTimezone === null
    ) {
      throw new AppException(
        'Quiet hours require start time, end time, and timezone.',
        HttpStatus.BAD_REQUEST,
        {
          code: ErrorCodes.badRequest,
        },
      );
    }

    if (
      nextPreference.inventoryAlertQuietHoursStartLocalTime ===
      nextPreference.inventoryAlertQuietHoursEndLocalTime
    ) {
      throw new AppException(
        'Quiet hours start and end time must differ.',
        HttpStatus.BAD_REQUEST,
        {
          code: ErrorCodes.badRequest,
        },
      );
    }

    this.assertValidTimeZone(nextPreference.inventoryAlertQuietHoursTimezone);

    return nextPreference;
  }

  private assertValidTimeZone(timeZone: string): void {
    try {
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
      }).format(new Date());
    } catch {
      throw new AppException(
        'Quiet hours timezone must be a valid IANA timezone.',
        HttpStatus.BAD_REQUEST,
        {
          code: ErrorCodes.badRequest,
        },
      );
    }
  }
}
