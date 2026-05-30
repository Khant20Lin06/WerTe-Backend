import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { MerchantInventoryAlertPreferenceDto, toMerchantInventoryAlertPreferenceDto } from '../dto/merchant-inventory-alert-preference.dto';
import {
  buildMerchantInventoryAlertPreferenceEntity,
  MerchantInventoryAlertPreferenceEntity,
} from '../entities/merchant-inventory-alert-preference.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { isInventoryAlertPushMutedNow, resolveNextQuietHoursBoundaryAt } from '../utils/notification-preference-time.util';
import { NotificationDeliveryService } from './notification-delivery.service';

@Injectable()
export class NotificationPreferenceScheduleService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationDeliveryService: NotificationDeliveryService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshAllSchedules();
  }

  onModuleDestroy(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
  }

  async rescheduleUser(userId: string, from = new Date()): Promise<void> {
    this.clearTimer(userId);
    await this.scheduleUser(userId, from);
  }

  async emitCurrentPreferenceStateByUserId(
    userId: string,
    at = new Date(),
  ): Promise<MerchantInventoryAlertPreferenceDto> {
    const preference = await this.loadPreferenceEntity(userId);
    const dto = toMerchantInventoryAlertPreferenceDto({
      preference,
      inventoryAlertPushCurrentlyMuted: isInventoryAlertPushMutedNow(
        preference,
        at,
      ),
    });

    this.notificationDeliveryService.emitNotificationPreferenceUpdated(
      userId,
      dto,
    );

    return dto;
  }

  private async refreshAllSchedules(at = new Date()): Promise<void> {
    const preferences =
      (await this.notificationsRepository.listNotificationPreferencesWithQuietHoursEnabled()) ??
      [];

    for (const preference of preferences) {
      this.schedulePreferenceEntity(
        buildMerchantInventoryAlertPreferenceEntity({
          userId: preference.userId,
          preference,
        }),
        at,
      );
    }
  }

  private async scheduleUser(userId: string, from = new Date()): Promise<void> {
    const preference = await this.loadPreferenceEntity(userId);

    this.schedulePreferenceEntity(preference, from);
  }

  private schedulePreferenceEntity(
    preference: MerchantInventoryAlertPreferenceEntity,
    from = new Date(),
  ): void {
    const nextBoundaryAt = resolveNextQuietHoursBoundaryAt(preference, from);

    if (nextBoundaryAt === null) {
      return;
    }

    const delayMs = Math.max(nextBoundaryAt.getTime() - from.getTime(), 0);
    const timer = setTimeout(() => {
      void this.handleBoundaryReached(preference.userId);
    }, delayMs);

    timer.unref?.();
    this.timers.set(preference.userId, timer);
    this.logger.debugEvent(
      'Scheduled merchant inventory alert quiet-hours boundary refresh.',
      {
        nextBoundaryAt: nextBoundaryAt.toISOString(),
        userId: preference.userId,
      },
      'NotificationPreferenceScheduleService',
    );
  }

  private async handleBoundaryReached(userId: string): Promise<void> {
    this.clearTimer(userId);
    const dto = await this.emitCurrentPreferenceStateByUserId(userId);

    await this.scheduleUser(userId);
    this.logger.logEvent(
      'Merchant inventory alert preference boundary refresh processed.',
      {
        activeDeliveryChannels: dto.activeDeliveryChannels,
        inventoryAlertPushCurrentlyMuted: dto.inventoryAlertPushCurrentlyMuted,
        userId,
      },
      'NotificationPreferenceScheduleService',
    );
  }

  private async loadPreferenceEntity(
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

  private clearTimer(userId: string): void {
    const timer = this.timers.get(userId);

    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(userId);
    }
  }
}
