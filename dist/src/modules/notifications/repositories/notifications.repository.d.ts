import { NotificationChannel, NotificationDeliveryStatus, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AdminInventoryAlertNotificationRecord, InventoryAlertNotificationSignatureRecord } from '../entities/admin-inventory-alert-notification.entity';
import { NotificationCenterRecord } from '../entities/notification-center.entity';
import { MerchantInventoryAlertPreferenceRecord } from '../entities/merchant-inventory-alert-preference.entity';
declare const pushNotificationDispatchInclude: {
    user: {
        select: {
            id: true;
            pushTokens: {
                select: {
                    id: true;
                    deviceId: true;
                    platform: true;
                    token: true;
                    lastSeenAt: true;
                };
            };
        };
    };
};
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
export declare class NotificationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listByUserId({ userId, limit, type, unreadOnly, }: ListNotificationsByUserInput): Promise<NotificationCenterRecord[]>;
    listPageByUserId({ userId, limit, type, unreadOnly, cursor, }: ListNotificationsByUserInput & {
        cursor?: string;
    }): Promise<{
        records: NotificationCenterRecord[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    listRecentInventoryAlerts(limit?: number): Promise<AdminInventoryAlertNotificationRecord[]>;
    listRecentInventoryAlertsByUserIdSince(userId: string, since: Date, limit?: number): Promise<InventoryAlertNotificationSignatureRecord[]>;
    listRecentInventoryAlertsByUserId(userId: string, limit?: number): Promise<AdminInventoryAlertNotificationRecord[]>;
    listUnreadInventoryAlertsByUserId(userId: string, limit?: number): Promise<NotificationCenterRecord[]>;
    findInventoryAlertsByIdsForUser(userId: string, notificationIds: string[]): Promise<NotificationCenterRecord[]>;
    findInventoryAlertById(notificationId: string): Promise<AdminInventoryAlertNotificationRecord | null>;
    findInventoryAlertsByIds(notificationIds: string[]): Promise<AdminInventoryAlertNotificationRecord[]>;
    countUnreadByUserId(userId: string): Promise<number>;
    create(payload: CreateNotificationInput): Promise<NotificationCenterRecord>;
    markRead(notificationId: string, userId: string, readAt?: Date): Promise<NotificationCenterRecord | null>;
    markManyRead(notificationIds: string[], userId: string, readAt?: Date): Promise<NotificationCenterRecord[]>;
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
    }): Prisma.Prisma__NotificationDeliveryClient<{
        status: import(".prisma/client").$Enums.NotificationDeliveryStatus;
        id: string;
        notificationId: string;
        providerMessageId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deliveredAt: Date | null;
        failureCode: string | null;
        failureMessage: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        queuedAt: Date | null;
        sentAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    markQueuedPushDeliveriesSent(notificationId: string, providerMessageId: string, sentAt?: Date): Prisma.PrismaPromise<Prisma.BatchPayload>;
    findNotificationPreferenceByUserId(userId: string): Prisma.Prisma__NotificationPreferenceClient<{
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inventoryAlertPushEnabled: boolean;
        inventoryAlertQuietHoursEnabled: boolean;
        inventoryAlertQuietHoursStartLocalTime: string | null;
        inventoryAlertQuietHoursEndLocalTime: string | null;
        inventoryAlertQuietHoursTimezone: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    upsertNotificationPreferenceByUserId(userId: string, payload: {
        inventoryAlertPushEnabled: boolean;
        inventoryAlertQuietHoursEnabled: boolean;
        inventoryAlertQuietHoursStartLocalTime: string | null;
        inventoryAlertQuietHoursEndLocalTime: string | null;
        inventoryAlertQuietHoursTimezone: string | null;
    }): Prisma.Prisma__NotificationPreferenceClient<{
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        inventoryAlertPushEnabled: boolean;
        inventoryAlertQuietHoursEnabled: boolean;
        inventoryAlertQuietHoursStartLocalTime: string | null;
        inventoryAlertQuietHoursEndLocalTime: string | null;
        inventoryAlertQuietHoursTimezone: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listNotificationPreferencesWithQuietHoursEnabled(): Promise<MerchantInventoryAlertPreferenceRecord[]>;
    markQueuedPushDeliveriesFailed(notificationId: string, failureCode: string, failureMessage: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
    findPushNotificationDispatchById(notificationId: string): Promise<PushNotificationDispatchRecord | null>;
    deletePushTokensByIds(userId: string, pushTokenIds: string[]): Promise<{
        count: number;
    }>;
}
export {};
