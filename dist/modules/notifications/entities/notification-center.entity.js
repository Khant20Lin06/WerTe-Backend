"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCenterEntity = exports.NotificationDeliveryEntity = exports.notificationCenterInclude = void 0;
exports.buildNotificationCenterEntity = buildNotificationCenterEntity;
const client_1 = require("@prisma/client");
exports.notificationCenterInclude = client_1.Prisma.validator()({
    order: {
        select: {
            orderCode: true,
            status: true,
        },
    },
    delivery: {
        select: {
            status: true,
            riderId: true,
        },
    },
    conversation: {
        select: {
            type: true,
        },
    },
    message: {
        select: {
            type: true,
            createdAt: true,
        },
    },
    deliveries: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
            id: true,
            channel: true,
            status: true,
            providerMessageId: true,
            failureCode: true,
            failureMessage: true,
            queuedAt: true,
            sentAt: true,
            deliveredAt: true,
            createdAt: true,
            updatedAt: true,
        },
    },
});
class NotificationDeliveryEntity {
}
exports.NotificationDeliveryEntity = NotificationDeliveryEntity;
class NotificationCenterEntity {
}
exports.NotificationCenterEntity = NotificationCenterEntity;
function buildNotificationCenterEntity(record) {
    return {
        notificationId: record.id,
        userId: record.userId,
        type: record.type,
        title: record.title,
        body: record.body,
        navigationPath: record.navigationPath ?? null,
        metadata: record.metadataJson ?? null,
        readAt: record.readAt?.toISOString() ?? null,
        orderId: record.orderId ?? null,
        orderCode: record.order?.orderCode ?? null,
        orderStatus: record.order?.status ?? null,
        deliveryId: record.deliveryId ?? null,
        deliveryStatus: record.delivery?.status ?? null,
        riderId: record.delivery?.riderId ?? null,
        conversationId: record.conversationId ?? null,
        conversationType: record.conversation?.type ?? null,
        messageId: record.messageId ?? null,
        messageType: record.message?.type ?? null,
        messageCreatedAt: record.message?.createdAt.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        deliveries: record.deliveries.map((delivery) => ({
            deliveryId: delivery.id,
            channel: delivery.channel,
            status: delivery.status,
            providerMessageId: delivery.providerMessageId ?? null,
            failureCode: delivery.failureCode ?? null,
            failureMessage: delivery.failureMessage ?? null,
            queuedAt: delivery.queuedAt?.toISOString() ?? null,
            sentAt: delivery.sentAt?.toISOString() ?? null,
            deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
            createdAt: delivery.createdAt.toISOString(),
            updatedAt: delivery.updatedAt.toISOString(),
        })),
    };
}
//# sourceMappingURL=notification-center.entity.js.map