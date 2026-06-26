import { NotificationChannel, NotificationDeliveryStatus, NotificationType, Prisma } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { BulkMarkInventoryAlertsReadDto } from '../dto/bulk-mark-inventory-alerts-read.dto';
import { BulkMarkInventoryAlertsReadResponseDto } from '../dto/bulk-mark-inventory-alerts-read-response.dto';
import { ListNotificationsQueryDto } from '../dto/list-notifications-query.dto';
import { NotificationContractEntity } from '../entities/notification-contract.entity';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationCenterPageEntity } from '../entities/notification-center-page.entity';
import { NotificationListPresetEntity } from '../entities/notification-list-preset.entity';
import { NotificationUnreadFacetsEntity } from '../entities/notification-unread-facets.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationDeliveryService } from './notification-delivery.service';
export declare class NotificationsService {
    private readonly notificationsRepository;
    private readonly auditService;
    private readonly notificationDeliveryService;
    constructor(notificationsRepository: NotificationsRepository, auditService: AuditService, notificationDeliveryService: NotificationDeliveryService);
    listUserNotifications(userId: string, query?: ListNotificationsQueryDto): Promise<NotificationCenterEntity[]>;
    listUserNotificationPage(userId: string, query?: ListNotificationsQueryDto): Promise<NotificationCenterPageEntity>;
    getUnreadCount(userId: string): Promise<number>;
    getUnreadFacets(userId: string): Promise<NotificationUnreadFacetsEntity>;
    listNotificationPresets(userId: string): Promise<NotificationListPresetEntity[]>;
    getNotificationContract(): NotificationContractEntity;
    bulkMarkInventoryAlertsRead(userId: string, payload: BulkMarkInventoryAlertsReadDto): Promise<BulkMarkInventoryAlertsReadResponseDto>;
    hasRecentMerchantInventoryAlert(input: {
        userId: string;
        resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
        resourceId: string;
        attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
        since: Date;
    }): Promise<boolean>;
    createNotification(payload: {
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
    }): Promise<NotificationCenterEntity>;
    markNotificationRead(userId: string, notificationId: string): Promise<NotificationCenterEntity | null>;
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
    markQueuedPushDeliveriesSent(notificationId: string, providerMessageId: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
    markQueuedPushDeliveriesFailed(notificationId: string, failureCode: string, failureMessage: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
    getPushNotificationDispatch(notificationId: string): Promise<({
        user: {
            id: string;
            pushTokens: {
                id: string;
                token: string;
                deviceId: string;
                platform: import(".prisma/client").$Enums.DevicePlatform;
                lastSeenAt: Date;
            }[];
        };
    } & {
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        title: string;
        id: string;
        navigationPath: string | null;
        body: string;
        createdAt: Date;
        conversationId: string | null;
        updatedAt: Date;
        orderId: string | null;
        metadataJson: Prisma.JsonValue | null;
        readAt: Date | null;
        deliveryId: string | null;
        messageId: string | null;
    }) | null>;
    deletePushTokensByIds(userId: string, pushTokenIds: string[]): Promise<{
        count: number;
    }>;
    private buildNotificationEntity;
    private buildNotificationPresetsFromFacets;
    private emitLiveUnreadState;
    private collectMatchingNotifications;
    private buildNotificationCenterEntities;
    private applyPreset;
    private resolveFetchLimit;
    private hasInventoryAlertFilters;
    private matchesQuery;
    private buildInventoryAlertEntity;
    private buildLatestLifecycleLogMap;
    private resolveInventoryAlertStatus;
    private hasLaterCompensationAlert;
    private buildPreset;
    private resolvePresetUnreadCount;
    private readMetadataString;
    private normalizeNotificationIds;
}
