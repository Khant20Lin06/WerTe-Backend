import { NotificationChannel, NotificationDeliveryStatus, NotificationType, Prisma } from '@prisma/client';
import { AdminInventoryAlertKind, AdminInventoryAlertStatus } from '../dto/admin-inventory-alert.dto';
export declare const notificationCenterInclude: {
    order: {
        select: {
            orderCode: true;
            status: true;
        };
    };
    delivery: {
        select: {
            status: true;
            riderId: true;
        };
    };
    conversation: {
        select: {
            type: true;
        };
    };
    message: {
        select: {
            type: true;
            createdAt: true;
        };
    };
    deliveries: {
        orderBy: [{
            createdAt: "asc";
        }, {
            id: "asc";
        }];
        select: {
            id: true;
            channel: true;
            status: true;
            providerMessageId: true;
            failureCode: true;
            failureMessage: true;
            queuedAt: true;
            sentAt: true;
            deliveredAt: true;
            createdAt: true;
            updatedAt: true;
        };
    };
};
export type NotificationCenterRecord = Prisma.NotificationGetPayload<{
    include: typeof notificationCenterInclude;
}>;
export declare class NotificationInventoryAlertEntity {
    alertKind: AdminInventoryAlertKind;
    status: AdminInventoryAlertStatus;
    branchId: string | null;
    branchName: string | null;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    resourceLabel: string;
    menuItemName: string | null;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK' | null;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    restoredQuantity: number | null;
    orderId: string | null;
    orderCode: string | null;
    reasonCode: string | null;
    acknowledgementNote: string | null;
    acknowledgedAt: string | null;
    statusNote: string | null;
    statusChangedAt: string | null;
}
export declare class NotificationDeliveryEntity {
    deliveryId: string;
    channel: NotificationChannel;
    status: NotificationDeliveryStatus;
    providerMessageId: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    queuedAt: string | null;
    sentAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare class NotificationCenterEntity {
    notificationId: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    navigationPath: string | null;
    metadata: Prisma.JsonValue | null;
    readAt: string | null;
    orderId: string | null;
    orderCode: string | null;
    orderStatus: string | null;
    deliveryId: string | null;
    deliveryStatus: string | null;
    riderId: string | null;
    conversationId: string | null;
    conversationType: string | null;
    messageId: string | null;
    messageType: string | null;
    messageCreatedAt: string | null;
    createdAt: string;
    updatedAt: string;
    inventoryAlert: NotificationInventoryAlertEntity | null;
    deliveries: NotificationDeliveryEntity[];
}
export declare function buildNotificationCenterEntity(record: NotificationCenterRecord, inventoryAlert?: NotificationInventoryAlertEntity | null): NotificationCenterEntity;
