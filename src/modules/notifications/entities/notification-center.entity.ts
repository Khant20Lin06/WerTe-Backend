import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

import {
  AdminInventoryAlertKind,
  AdminInventoryAlertStatus,
} from '../dto/admin-inventory-alert.dto';

export const notificationCenterInclude =
  Prisma.validator<Prisma.NotificationInclude>()({
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

export type NotificationCenterRecord = Prisma.NotificationGetPayload<{
  include: typeof notificationCenterInclude;
}>;

export class NotificationInventoryAlertEntity {
  @ApiProperty({ example: 'ATTENTION' })
  alertKind!: AdminInventoryAlertKind;

  @ApiProperty({ example: 'OPEN' })
  status!: AdminInventoryAlertStatus;

  @ApiProperty({ example: 'branch_1', nullable: true })
  branchId!: string | null;

  @ApiProperty({ example: 'Downtown Branch', nullable: true })
  branchName!: string | null;

  @ApiProperty({ example: 'MENU_ITEM' })
  resourceType!: 'MENU_ITEM' | 'ITEM_OPTION';

  @ApiProperty({ example: 'item_1' })
  resourceId!: string;

  @ApiProperty({ example: 'Mohinga' })
  resourceLabel!: string;

  @ApiProperty({ example: 'Mohinga', nullable: true })
  menuItemName!: string | null;

  @ApiProperty({ example: 'LOW_STOCK', nullable: true })
  attentionLevel!: 'LOW_STOCK' | 'OUT_OF_STOCK' | null;

  @ApiProperty({ example: 2, nullable: true })
  stockQuantity!: number | null;

  @ApiProperty({ example: 3, nullable: true })
  lowStockThreshold!: number | null;

  @ApiProperty({ example: 1, nullable: true })
  restoredQuantity!: number | null;

  @ApiProperty({ example: 'order_1', nullable: true })
  orderId!: string | null;

  @ApiProperty({ example: 'ORD-00000001', nullable: true })
  orderCode!: string | null;

  @ApiProperty({ example: 'customer_cancelled', nullable: true })
  reasonCode!: string | null;

  @ApiProperty({ example: 'Ops reached merchant.', nullable: true })
  acknowledgementNote!: string | null;

  @ApiProperty({ example: '2026-05-01T10:15:00.000Z', nullable: true })
  acknowledgedAt!: string | null;

  @ApiProperty({ example: 'Restock confirmed.', nullable: true })
  statusNote!: string | null;

  @ApiProperty({ example: '2026-05-01T10:20:00.000Z', nullable: true })
  statusChangedAt!: string | null;
}

export class NotificationDeliveryEntity {
  @ApiProperty({ example: 'delivery_attempt_1' })
  deliveryId!: string;

  @ApiProperty({ example: NotificationChannel.PUSH, enum: NotificationChannel })
  channel!: NotificationChannel;

  @ApiProperty({
    example: NotificationDeliveryStatus.SENT,
    enum: NotificationDeliveryStatus,
  })
  status!: NotificationDeliveryStatus;

  @ApiProperty({ example: 'provider_1', nullable: true })
  providerMessageId!: string | null;

  @ApiProperty({ example: 'INVALID_PUSH_TOKENS', nullable: true })
  failureCode!: string | null;

  @ApiProperty({ example: 'All registered push tokens were rejected.', nullable: true })
  failureMessage!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z', nullable: true })
  queuedAt!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:01.000Z', nullable: true })
  sentAt!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:02.000Z', nullable: true })
  deliveredAt!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T10:00:02.000Z' })
  updatedAt!: string;
}

export class NotificationCenterEntity {
  @ApiProperty({ example: 'notification_1' })
  notificationId!: string;

  @ApiProperty({ example: 'usr_merchant_1' })
  userId!: string;

  @ApiProperty({
    example: NotificationType.SYSTEM_ALERT,
    enum: NotificationType,
  })
  type!: NotificationType;

  @ApiProperty({ example: 'Low stock: Mohinga' })
  title!: string;

  @ApiProperty({ example: 'Mohinga is now low in Downtown Branch with 2 left.' })
  body!: string;

  @ApiProperty({ example: '/merchant/branches/branch_1/inventory/overview', nullable: true })
  navigationPath!: string | null;

  @ApiProperty({ example: { source: 'inventory' }, nullable: true })
  metadata!: Prisma.JsonValue | null;

  @ApiProperty({ example: '2026-05-01T10:05:00.000Z', nullable: true })
  readAt!: string | null;

  @ApiProperty({ example: 'order_1', nullable: true })
  orderId!: string | null;

  @ApiProperty({ example: 'ORD-00000001', nullable: true })
  orderCode!: string | null;

  @ApiProperty({ example: 'PREPARING', nullable: true })
  orderStatus!: string | null;

  @ApiProperty({ example: 'delivery_1', nullable: true })
  deliveryId!: string | null;

  @ApiProperty({ example: 'ASSIGNED', nullable: true })
  deliveryStatus!: string | null;

  @ApiProperty({ example: 'rider_1', nullable: true })
  riderId!: string | null;

  @ApiProperty({ example: 'conversation_1', nullable: true })
  conversationId!: string | null;

  @ApiProperty({ example: 'ORDER_CHAT', nullable: true })
  conversationType!: string | null;

  @ApiProperty({ example: 'message_1', nullable: true })
  messageId!: string | null;

  @ApiProperty({ example: 'TEXT', nullable: true })
  messageType!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z', nullable: true })
  messageCreatedAt!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: NotificationInventoryAlertEntity, nullable: true })
  inventoryAlert!: NotificationInventoryAlertEntity | null;

  @ApiProperty({ type: NotificationDeliveryEntity, isArray: true })
  deliveries!: NotificationDeliveryEntity[];
}

export function buildNotificationCenterEntity(
  record: NotificationCenterRecord,
  inventoryAlert: NotificationInventoryAlertEntity | null = null,
): NotificationCenterEntity {
  return {
    notificationId: record.id,
    userId: record.userId,
    type: record.type,
    title: record.title,
    body: record.body,
    navigationPath: record.navigationPath ?? null,
    metadata: (record.metadataJson as Prisma.JsonValue | null) ?? null,
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
