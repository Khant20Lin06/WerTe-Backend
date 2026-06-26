"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCenterEntity = exports.NotificationDeliveryEntity = exports.NotificationInventoryAlertEntity = exports.notificationCenterInclude = void 0;
exports.buildNotificationCenterEntity = buildNotificationCenterEntity;
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const admin_inventory_alert_dto_1 = require("../dto/admin-inventory-alert.dto");
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
class NotificationInventoryAlertEntity {
}
exports.NotificationInventoryAlertEntity = NotificationInventoryAlertEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ATTENTION' }),
    __metadata("design:type", String)
], NotificationInventoryAlertEntity.prototype, "alertKind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OPEN' }),
    __metadata("design:type", String)
], NotificationInventoryAlertEntity.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'branch_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Downtown Branch', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MENU_ITEM' }),
    __metadata("design:type", String)
], NotificationInventoryAlertEntity.prototype, "resourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'item_1' }),
    __metadata("design:type", String)
], NotificationInventoryAlertEntity.prototype, "resourceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mohinga' }),
    __metadata("design:type", String)
], NotificationInventoryAlertEntity.prototype, "resourceLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mohinga', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "menuItemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LOW_STOCK', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "attentionLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "stockQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "lowStockThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "restoredQuantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORD-00000001', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "orderCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'customer_cancelled', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "reasonCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ops reached merchant.', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "acknowledgementNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:15:00.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Restock confirmed.', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "statusNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:20:00.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationInventoryAlertEntity.prototype, "statusChangedAt", void 0);
class NotificationDeliveryEntity {
}
exports.NotificationDeliveryEntity = NotificationDeliveryEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'delivery_attempt_1' }),
    __metadata("design:type", String)
], NotificationDeliveryEntity.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: client_1.NotificationChannel.PUSH, enum: client_1.NotificationChannel }),
    __metadata("design:type", String)
], NotificationDeliveryEntity.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.NotificationDeliveryStatus.SENT,
        enum: client_1.NotificationDeliveryStatus,
    }),
    __metadata("design:type", String)
], NotificationDeliveryEntity.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'provider_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationDeliveryEntity.prototype, "providerMessageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INVALID_PUSH_TOKENS', nullable: true }),
    __metadata("design:type", Object)
], NotificationDeliveryEntity.prototype, "failureCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'All registered push tokens were rejected.', nullable: true }),
    __metadata("design:type", Object)
], NotificationDeliveryEntity.prototype, "failureMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:00.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationDeliveryEntity.prototype, "queuedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:01.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationDeliveryEntity.prototype, "sentAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:02.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationDeliveryEntity.prototype, "deliveredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], NotificationDeliveryEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:02.000Z' }),
    __metadata("design:type", String)
], NotificationDeliveryEntity.prototype, "updatedAt", void 0);
class NotificationCenterEntity {
}
exports.NotificationCenterEntity = NotificationCenterEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'notification_1' }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "notificationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usr_merchant_1' }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: client_1.NotificationType.SYSTEM_ALERT,
        enum: client_1.NotificationType,
    }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Low stock: Mohinga' }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mohinga is now low in Downtown Branch with 2 left.' }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/merchant/branches/branch_1/inventory/overview', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "navigationPath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { source: 'inventory' }, nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:05:00.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORD-00000001', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "orderCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PREPARING', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "orderStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'delivery_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "deliveryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ASSIGNED', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "deliveryStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'rider_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "riderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'conversation_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "conversationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORDER_CHAT', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "conversationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'message_1', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TEXT', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:00.000Z', nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "messageCreatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], NotificationCenterEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationInventoryAlertEntity, nullable: true }),
    __metadata("design:type", Object)
], NotificationCenterEntity.prototype, "inventoryAlert", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationDeliveryEntity, isArray: true }),
    __metadata("design:type", Array)
], NotificationCenterEntity.prototype, "deliveries", void 0);
function buildNotificationCenterEntity(record, inventoryAlert = null) {
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
        inventoryAlert,
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