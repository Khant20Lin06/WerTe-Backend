import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { FcmService } from '../infrastructure/notifications/fcm.service';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { NotificationsService } from '../modules/notifications/services/notifications.service';

type PushNotificationJobPayload = {
  notificationId: string;
  attempt?: number;
};

@Injectable()
export class PushNotificationJob implements OnModuleInit {
  private static readonly retryDelaysMs = [5_000, 30_000];
  private static readonly maxAttempts =
    PushNotificationJob.retryDelaysMs.length + 1;

  constructor(
    private readonly queueService: QueueService,
    private readonly notificationsService: NotificationsService,
    private readonly fcmService: FcmService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.notifications,
      QueueJobNames.notifications.pushNotification,
      (payload) => this.handle(payload as PushNotificationJobPayload),
    );
  }

  async handle(payload: PushNotificationJobPayload) {
    const attempt = this.resolveAttempt(payload.attempt);
    const notification =
      await this.notificationsService.getPushNotificationDispatch(
        payload.notificationId,
      );

    if (notification === null) {
      this.logger.logEvent(
        'Push notification job skipped because the notification no longer exists.',
        {
          attempt,
          notificationId: payload.notificationId,
        },
        'PushNotificationJob',
      );
      return;
    }

    const pushTokensByValue = new Map(
      notification.user.pushTokens.map((pushToken) => [pushToken.token, pushToken]),
    );
    const deviceTokens = [...pushTokensByValue.keys()];

    if (deviceTokens.length === 0) {
      await this.notificationsService.markQueuedPushDeliveriesFailed(
        payload.notificationId,
        'NO_ACTIVE_PUSH_TOKEN',
        'No active push tokens are registered for this user.',
      );
      this.logger.logEvent(
        'Push notification job marked delivery as failed because no active push tokens were registered.',
        {
          attempt,
          notificationId: payload.notificationId,
          userId: notification.user.id,
        },
        'PushNotificationJob',
      );
      return;
    }

    try {
      const result = await this.fcmService.send({
        notificationId: payload.notificationId,
        userId: notification.user.id,
        title: notification.title,
        body: notification.body,
        navigationPath: notification.navigationPath ?? null,
        deviceTokens,
      });

      if (result.invalidDeviceTokens.length > 0) {
        const invalidPushTokenIds = result.invalidDeviceTokens
          .map((token) => pushTokensByValue.get(token)?.id ?? null)
          .filter((pushTokenId): pushTokenId is string => pushTokenId !== null);

        await this.notificationsService.deletePushTokensByIds(
          notification.user.id,
          invalidPushTokenIds,
        );
      }

      if (result.deliveredDeviceTokens.length === 0 || result.providerMessageId === null) {
        await this.notificationsService.markQueuedPushDeliveriesFailed(
          payload.notificationId,
          'INVALID_PUSH_TOKENS',
          'All registered push tokens were rejected by the provider.',
        );
        this.logger.logEvent(
          'Push notification job removed invalid push tokens after provider rejection.',
          {
            attempt,
            notificationId: payload.notificationId,
            userId: notification.user.id,
            invalidDeviceTokenCount: result.invalidDeviceTokens.length,
          },
          'PushNotificationJob',
        );
        return;
      }

      await this.notificationsService.markQueuedPushDeliveriesSent(
        payload.notificationId,
        result.providerMessageId,
      );
      this.logger.logEvent(
        'Push notification baseline job processed.',
        {
          attempt,
          notificationId: payload.notificationId,
          providerMessageId: result.providerMessageId,
          userId: notification.user.id,
          deviceTokenCount: deviceTokens.length,
          deliveredDeviceTokenCount: result.deliveredDeviceTokens.length,
          invalidDeviceTokenCount: result.invalidDeviceTokens.length,
        },
        'PushNotificationJob',
      );
    } catch (error) {
      const failureMessage =
        error instanceof Error ? error.message : 'Unknown push provider failure.';

      if (this.shouldRetry(attempt)) {
        const retryDelayMs = this.resolveRetryDelayMs(attempt);
        const nextAttempt = attempt + 1;

        await this.notificationsService.markQueuedPushDeliveriesFailed(
          payload.notificationId,
          'PUSH_PROVIDER_TRANSIENT_ERROR',
          `Attempt ${attempt} of ${PushNotificationJob.maxAttempts} failed. Retry ${nextAttempt} scheduled in ${retryDelayMs}ms. ${failureMessage}`,
        );
        await this.notificationsService.createDeliveryAttempt({
          notificationId: payload.notificationId,
          channel: NotificationChannel.PUSH,
          status: NotificationDeliveryStatus.QUEUED,
          queuedAt: new Date(),
        });
        await this.queueService.add(
          QueueNames.notifications,
          QueueJobNames.notifications.pushNotification,
          {
            notificationId: payload.notificationId,
            attempt: nextAttempt,
          },
          {
            delayMs: retryDelayMs,
          },
        );
        this.logger.logEvent(
          'Push notification job scheduled a retry after a transient provider failure.',
          {
            attempt,
            failureMessage,
            nextAttempt,
            notificationId: payload.notificationId,
            retryDelayMs,
            userId: notification.user.id,
          },
          'PushNotificationJob',
        );
        return;
      }

      await this.notificationsService.markQueuedPushDeliveriesFailed(
        payload.notificationId,
        'PUSH_PROVIDER_ERROR',
        `Attempt ${attempt} of ${PushNotificationJob.maxAttempts} failed. ${failureMessage}`,
      );
      this.logger.logEvent(
        'Push notification job failed to deliver through the provider.',
        {
          attempt,
          notificationId: payload.notificationId,
          userId: notification.user.id,
          failureMessage,
        },
        'PushNotificationJob',
      );
    }
  }

  private resolveAttempt(attempt: number | undefined): number {
    if (attempt === undefined || !Number.isFinite(attempt)) {
      return 1;
    }

    return Math.max(1, Math.floor(attempt));
  }

  private shouldRetry(attempt: number): boolean {
    return attempt < PushNotificationJob.maxAttempts;
  }

  private resolveRetryDelayMs(attempt: number): number {
    return (
      PushNotificationJob.retryDelaysMs[attempt - 1] ??
      PushNotificationJob.retryDelaysMs[
        PushNotificationJob.retryDelaysMs.length - 1
      ]
    );
  }
}
