import { NotificationChannel, NotificationDeliveryStatus, NotificationType, Prisma } from '@prisma/client';
import { NotificationCenterEntity } from '../entities/notification-center.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
export declare class NotificationsService {
    private readonly notificationsRepository;
    constructor(notificationsRepository: NotificationsRepository);
    listUserNotifications(userId: string, limit?: number): Promise<NotificationCenterEntity[]>;
    getUnreadCount(userId: string): Promise<number>;
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
        createdAt: Date;
        updatedAt: Date;
        deliveredAt: Date | null;
        notificationId: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        providerMessageId: string | null;
        failureCode: string | null;
        failureMessage: string | null;
        queuedAt: Date | null;
        sentAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
