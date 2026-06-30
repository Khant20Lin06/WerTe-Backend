import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  adminInventoryAlertNotificationInclude,
  AdminInventoryAlertNotificationRecord,
  InventoryAlertNotificationSignatureRecord,
} from '../entities/admin-inventory-alert-notification.entity';
import {
  NotificationCenterRecord,
  notificationCenterInclude,
} from '../entities/notification-center.entity';
import {
  merchantInventoryAlertPreferenceSelect,
  MerchantInventoryAlertPreferenceRecord,
} from '../entities/merchant-inventory-alert-preference.entity';

const pushNotificationDispatchInclude =
  Prisma.validator<Prisma.NotificationInclude>()({
    user: {
      select: {
        id: true,
        pushTokens: {
          select: {
            id: true,
            deviceId: true,
            platform: true,
            token: true,
            lastSeenAt: true,
          },
        },
      },
    },
  });

export type PushNotificationDispatchRecord = Prisma.NotificationGetPayload<{
  include: typeof pushNotificationDispatchInclude;
}>;

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  navigationPath?: string | null;
  metadataJson?: Prisma.InputJsonValue;
  orderId?: string | null;
  deliveryId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
};

type ListNotificationsByUserInput = {
  userId: string;
  limit?: number;
  type?: NotificationType;
  unreadOnly?: boolean;
};

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByUserId({
    userId,
    limit = 20,
    type,
    unreadOnly = false,
  }: ListNotificationsByUserInput): Promise<NotificationCenterRecord[]> {
    return this.listPageByUserId({
      userId,
      limit,
      type,
      unreadOnly,
    }).then((page) => page.records);
  }

  async listPageByUserId({
    userId,
    limit = 20,
    type,
    unreadOnly = false,
    cursor,
  }: ListNotificationsByUserInput & {
    cursor?: string;
  }): Promise<{
    records: NotificationCenterRecord[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const boundedLimit = Math.min(Math.max(limit, 1), 500);
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        type,
        readAt: unreadOnly ? null : undefined,
      },
      include: notificationCenterInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      cursor:
        cursor === undefined
          ? undefined
          : {
              id: cursor,
            },
      skip: cursor === undefined ? 0 : 1,
      take: boundedLimit + 1,
    });
    const hasMore = notifications.length > boundedLimit;
    const slice = hasMore ? notifications.slice(0, boundedLimit) : notifications;

    return {
      records: slice,
      nextCursor: hasMore ? slice[slice.length - 1]?.id ?? null : null,
      hasMore,
    };
  }

  listRecentInventoryAlerts(limit = 50): Promise<AdminInventoryAlertNotificationRecord[]> {
    return this.prisma.notification.findMany({
      where: {
        type: NotificationType.SYSTEM_ALERT,
      },
      include: adminInventoryAlertNotificationInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  listRecentInventoryAlertsByUserIdSince(
    userId: string,
    since: Date,
    limit = 25,
  ): Promise<InventoryAlertNotificationSignatureRecord[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        type: NotificationType.SYSTEM_ALERT,
        createdAt: {
          gte: since,
        },
      },
      select: {
        id: true,
        type: true,
        metadataJson: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  listRecentInventoryAlertsByUserId(
    userId: string,
    limit = 200,
  ): Promise<AdminInventoryAlertNotificationRecord[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        type: NotificationType.SYSTEM_ALERT,
      },
      include: adminInventoryAlertNotificationInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  listUnreadInventoryAlertsByUserId(
    userId: string,
    limit?: number,
  ): Promise<NotificationCenterRecord[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        type: NotificationType.SYSTEM_ALERT,
        readAt: null,
      },
      include: notificationCenterInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findInventoryAlertsByIdsForUser(
    userId: string,
    notificationIds: string[],
  ): Promise<NotificationCenterRecord[]> {
    if (notificationIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.notification.findMany({
      where: {
        userId,
        type: NotificationType.SYSTEM_ALERT,
        id: {
          in: notificationIds,
        },
      },
      include: notificationCenterInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findInventoryAlertById(
    notificationId: string,
  ): Promise<AdminInventoryAlertNotificationRecord | null> {
    return this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        type: NotificationType.SYSTEM_ALERT,
      },
      include: adminInventoryAlertNotificationInclude,
    });
  }

  findInventoryAlertsByIds(
    notificationIds: string[],
  ): Promise<AdminInventoryAlertNotificationRecord[]> {
    if (notificationIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.notification.findMany({
      where: {
        id: {
          in: notificationIds,
        },
        type: NotificationType.SYSTEM_ALERT,
      },
      include: adminInventoryAlertNotificationInclude,
    });
  }

  countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  create(payload: CreateNotificationInput): Promise<NotificationCenterRecord> {
    return this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        navigationPath: payload.navigationPath ?? null,
        metadataJson: payload.metadataJson,
        orderId: payload.orderId ?? null,
        deliveryId: payload.deliveryId ?? null,
        conversationId: payload.conversationId ?? null,
        messageId: payload.messageId ?? null,
      },
      include: notificationCenterInclude,
    });
  }

  markRead(
    notificationId: string,
    userId: string,
    readAt = new Date(),
  ): Promise<NotificationCenterRecord | null> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
        include: notificationCenterInclude,
      });

      if (existing === null) {
        return null;
      }

      if (existing.readAt !== null) {
        return existing;
      }

      return tx.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          readAt,
        },
        include: notificationCenterInclude,
      });
    });
  }

  markManyRead(
    notificationIds: string[],
    userId: string,
    readAt = new Date(),
  ): Promise<NotificationCenterRecord[]> {
    if (notificationIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.notification.findMany({
        where: {
          userId,
          id: {
            in: notificationIds,
          },
        },
        include: notificationCenterInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });

      if (existing.length === 0) {
        return [];
      }

      const unreadIds = existing
        .filter((notification) => notification.readAt === null)
        .map((notification) => notification.id);

      if (unreadIds.length > 0) {
        await tx.notification.updateMany({
          where: {
            userId,
            id: {
              in: unreadIds,
            },
            readAt: null,
          },
          data: {
            readAt,
          },
        });
      }

      return tx.notification.findMany({
        where: {
          userId,
          id: {
            in: existing.map((notification) => notification.id),
          },
        },
        include: notificationCenterInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
    });
  }

  async markAllRead(userId: string, readAt = new Date()): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt,
      },
    });

    return result.count;
  }

  async pruneOldNotifications(userId: string, keep = 20): Promise<number> {
    const stale = await this.prisma.notification.findMany({
      where: { userId },
      select: { id: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: keep,
    });

    if (stale.length === 0) {
      return 0;
    }

    const result = await this.prisma.notification.deleteMany({
      where: {
        id: { in: stale.map((n) => n.id) },
      },
    });

    return result.count;
  }

  createDeliveryAttempt(payload: {
    notificationId: string;
    channel: NotificationChannel;
    status?: NotificationDeliveryStatus;
    providerMessageId?: string | null;
    failureCode?: string | null;
    failureMessage?: string | null;
    queuedAt?: Date | null;
    sentAt?: Date | null;
    deliveredAt?: Date | null;
  }) {
    return this.prisma.notificationDelivery.create({
      data: {
        notificationId: payload.notificationId,
        channel: payload.channel,
        status: payload.status ?? NotificationDeliveryStatus.PENDING,
        providerMessageId: payload.providerMessageId ?? null,
        failureCode: payload.failureCode ?? null,
        failureMessage: payload.failureMessage ?? null,
        queuedAt: payload.queuedAt ?? null,
        sentAt: payload.sentAt ?? null,
        deliveredAt: payload.deliveredAt ?? null,
      },
    });
  }

  markQueuedPushDeliveriesSent(
    notificationId: string,
    providerMessageId: string,
    sentAt = new Date(),
  ) {
    return this.prisma.notificationDelivery.updateMany({
      where: {
        notificationId,
        channel: NotificationChannel.PUSH,
        status: {
          in: [
            NotificationDeliveryStatus.PENDING,
            NotificationDeliveryStatus.QUEUED,
          ],
        },
      },
      data: {
        status: NotificationDeliveryStatus.SENT,
        providerMessageId,
        sentAt,
      },
    });
  }

  findNotificationPreferenceByUserId(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: {
        userId,
      },
    });
  }

  upsertNotificationPreferenceByUserId(
    userId: string,
    payload: {
      inventoryAlertPushEnabled: boolean;
      inventoryAlertQuietHoursEnabled: boolean;
      inventoryAlertQuietHoursStartLocalTime: string | null;
      inventoryAlertQuietHoursEndLocalTime: string | null;
      inventoryAlertQuietHoursTimezone: string | null;
    },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        inventoryAlertPushEnabled: payload.inventoryAlertPushEnabled,
        inventoryAlertQuietHoursEnabled: payload.inventoryAlertQuietHoursEnabled,
        inventoryAlertQuietHoursStartLocalTime:
          payload.inventoryAlertQuietHoursStartLocalTime,
        inventoryAlertQuietHoursEndLocalTime:
          payload.inventoryAlertQuietHoursEndLocalTime,
        inventoryAlertQuietHoursTimezone: payload.inventoryAlertQuietHoursTimezone,
      },
      update: {
        inventoryAlertPushEnabled: payload.inventoryAlertPushEnabled,
        inventoryAlertQuietHoursEnabled: payload.inventoryAlertQuietHoursEnabled,
        inventoryAlertQuietHoursStartLocalTime:
          payload.inventoryAlertQuietHoursStartLocalTime,
        inventoryAlertQuietHoursEndLocalTime:
          payload.inventoryAlertQuietHoursEndLocalTime,
        inventoryAlertQuietHoursTimezone: payload.inventoryAlertQuietHoursTimezone,
      },
    });
  }

  listNotificationPreferencesWithQuietHoursEnabled(): Promise<
    MerchantInventoryAlertPreferenceRecord[]
  > {
    return this.prisma.notificationPreference.findMany({
      where: {
        inventoryAlertPushEnabled: true,
        inventoryAlertQuietHoursEnabled: true,
        inventoryAlertQuietHoursStartLocalTime: {
          not: null,
        },
        inventoryAlertQuietHoursEndLocalTime: {
          not: null,
        },
        inventoryAlertQuietHoursTimezone: {
          not: null,
        },
      },
      select: merchantInventoryAlertPreferenceSelect,
    });
  }

  markQueuedPushDeliveriesFailed(
    notificationId: string,
    failureCode: string,
    failureMessage: string,
  ) {
    return this.prisma.notificationDelivery.updateMany({
      where: {
        notificationId,
        channel: NotificationChannel.PUSH,
        status: {
          in: [
            NotificationDeliveryStatus.PENDING,
            NotificationDeliveryStatus.QUEUED,
          ],
        },
      },
      data: {
        status: NotificationDeliveryStatus.FAILED,
        failureCode,
        failureMessage,
      },
    });
  }

  findPushNotificationDispatchById(
    notificationId: string,
  ): Promise<PushNotificationDispatchRecord | null> {
    return this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      include: pushNotificationDispatchInclude,
    });
  }

  deletePushTokensByIds(userId: string, pushTokenIds: string[]) {
    if (pushTokenIds.length === 0) {
      return Promise.resolve({
        count: 0,
      });
    }

    return this.prisma.pushToken.deleteMany({
      where: {
        userId,
        id: {
          in: pushTokenIds,
        },
      },
    });
  }
}
