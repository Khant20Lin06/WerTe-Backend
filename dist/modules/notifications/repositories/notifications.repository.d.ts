import { NotificationChannel, NotificationDeliveryStatus, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { NotificationCenterRecord } from '../entities/notification-center.entity';
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
export declare class NotificationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listByUserId(userId: string, limit?: number): Promise<NotificationCenterRecord[]>;
    countUnreadByUserId(userId: string): Promise<number>;
    create(payload: CreateNotificationInput): Promise<NotificationCenterRecord>;
    markRead(notificationId: string, userId: string, readAt?: Date): Promise<NotificationCenterRecord | null>;
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
export {};
