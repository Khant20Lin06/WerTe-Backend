import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  SystemMessageCode,
  UserRole,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import {
  QueueJobNames,
  QueueNames,
} from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../../messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../messaging/entities/sent-message.entity';
import type { MenuInventoryCompensationEvent } from '../../menus/services/menu-inventory-lifecycle.service';
import {
  AdminInventoryAttentionLevel,
  readAdminInventoryAlertMetadata,
} from '../entities/admin-inventory-alert-notification.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationEventService {
  private static readonly inventoryAlertCooldownMs = 15 * 60 * 1000;
  private static readonly inventoryAlertAcknowledgementAction =
    'inventory_alerts.acknowledged';
  private static readonly inventoryAlertResolutionAction =
    'inventory_alerts.resolved';
  private static readonly inventoryAlertDismissalAction =
    'inventory_alerts.dismissed';

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
    private readonly queueService: QueueService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly auditService: AuditService,
  ) {}

  async publishOrderEvent(input: {
    currentUser: AuthenticatedUserEntity;
    order: ConversationOrderContextEntity;
    conversation: ResolvedConversationEntity;
    message: SentMessageEntity;
    code: SystemMessageCode;
  }): Promise<void> {
    const recipientUserIds = this.resolveRecipientUserIds(
      input.conversation,
      input.currentUser.userId,
    );

    for (const userId of recipientUserIds) {
      const notification = await this.notificationsService.createNotification({
        userId,
        type: this.mapSystemMessageCodeToNotificationType(input.code),
        title: this.buildOrderNotificationTitle(input.code, input.order.orderCode),
        body: input.message.body,
        navigationPath: `/orders/${input.order.orderId}`,
        metadataJson: {
          orderCode: input.order.orderCode,
          conversationId: input.conversation.conversationId,
          messageId: input.message.messageId,
          systemMessageCode: input.code,
        },
        orderId: input.order.orderId,
        deliveryId: input.order.deliveryId ?? undefined,
        conversationId: input.conversation.conversationId,
        messageId: input.message.messageId,
      });

      await this.recordDefaultDeliveries(notification.notificationId);
    }
  }

  async publishConversationMessage(input: {
    currentUser: AuthenticatedUserEntity;
    order: ConversationOrderContextEntity | null;
    conversation: ResolvedConversationEntity;
    message: SentMessageEntity;
  }): Promise<void> {
    const recipientUserIds = this.resolveRecipientUserIds(
      input.conversation,
      input.currentUser.userId,
    );

    for (const userId of recipientUserIds) {
      const notification = await this.notificationsService.createNotification({
        userId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: this.buildConversationMessageTitle(input.order?.orderCode ?? null),
        body: this.buildConversationMessageBody(
          input.currentUser.role,
          input.message,
        ),
        navigationPath: `/messages/conversations/${input.conversation.conversationId}`,
        metadataJson: {
          conversationId: input.conversation.conversationId,
          messageId: input.message.messageId,
          orderId: input.order?.orderId ?? null,
          messageType: input.message.type,
        },
        orderId: input.order?.orderId ?? null,
        conversationId: input.conversation.conversationId,
        messageId: input.message.messageId,
      });

      await this.recordDefaultDeliveries(notification.notificationId);
    }
  }

  async publishOrderAutoCancelled(input: {
    customerUserId: string;
    orderId: string;
    orderCode: string;
    reasonCode: 'merchant_timeout' | 'rider_timeout';
  }): Promise<void> {
    const body =
      input.reasonCode === 'merchant_timeout'
        ? `Order #${input.orderCode} was cancelled because the merchant did not respond in time.`
        : `Order #${input.orderCode} was cancelled because no rider could be assigned in time.`;

    const notification = await this.notificationsService.createNotification({
      userId: input.customerUserId,
      type: NotificationType.ORDER_STATUS_UPDATED,
      title: 'Order Cancelled Automatically',
      body,
      navigationPath: `/orders/${input.orderId}`,
      metadataJson: { orderCode: input.orderCode, reasonCode: input.reasonCode },
      orderId: input.orderId,
    });

    await this.recordDefaultDeliveries(notification.notificationId);
  }

  async publishMerchantInventoryAlert(input: {
    merchantUserId: string;
    branchId: string;
    branchName?: string | null;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    resourceLabel: string;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    menuItemName?: string | null;
  }): Promise<void> {
    const hasRecentDuplicate =
      await this.notificationsService.hasRecentMerchantInventoryAlert({
        userId: input.merchantUserId,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        attentionLevel: input.attentionLevel,
        since: new Date(
          Date.now() - NotificationEventService.inventoryAlertCooldownMs,
        ),
      });

    if (hasRecentDuplicate) {
      return;
    }

    const notification = await this.notificationsService.createNotification({
      userId: input.merchantUserId,
      type: NotificationType.SYSTEM_ALERT,
      title: this.buildInventoryAlertTitle(input),
      body: this.buildInventoryAlertBody(input),
      navigationPath: `/merchant/branches/${input.branchId}/inventory/overview`,
      metadataJson: {
        alertKind: 'ATTENTION',
        branchId: input.branchId,
        branchName: input.branchName ?? null,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        resourceLabel: input.resourceLabel,
        attentionLevel: input.attentionLevel,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
        menuItemName: input.menuItemName ?? null,
      },
    });

    await this.recordMerchantInventoryAlertDeliveries(
      notification.notificationId,
      input.merchantUserId,
    );
  }

  async publishMerchantInventoryCompensationAlert(
    input: MenuInventoryCompensationEvent & {
      orderId: string;
      orderCode: string;
      reasonCode?: string | null;
      note?: string | null;
    },
  ): Promise<void> {
    const notification = await this.notificationsService.createNotification({
      userId: input.merchantUserId,
      type: NotificationType.SYSTEM_ALERT,
      title: this.buildInventoryCompensationTitle(input),
      body: this.buildInventoryCompensationBody(input),
      navigationPath: `/merchant/branches/${input.branchId}/inventory/overview`,
      metadataJson: {
        alertKind: 'COMPENSATION',
        branchId: input.branchId,
        branchName: input.branchName ?? null,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        resourceLabel: input.resourceLabel,
        restoredQuantity: input.restoredQuantity,
        stockQuantity: input.stockQuantity,
        lowStockThreshold: input.lowStockThreshold,
        menuItemName: input.menuItemName ?? null,
        orderId: input.orderId,
        orderCode: input.orderCode,
        reasonCode: input.reasonCode ?? null,
        note: input.note ?? null,
      },
      orderId: input.orderId,
    });

    await this.recordMerchantInventoryAlertDeliveries(
      notification.notificationId,
      input.merchantUserId,
    );
    await this.autoResolveRecoveredInventoryAlerts(input, notification.notificationId);
  }

  private resolveRecipientUserIds(
    conversation: ResolvedConversationEntity,
    actorUserId: string,
  ): string[] {
    return conversation.participants
      .filter(
        (participant) =>
          participant.leftAt === null &&
          participant.userId !== null &&
          participant.userId !== actorUserId,
      )
      .map((participant) => participant.userId as string);
  }

  private mapSystemMessageCodeToNotificationType(
    code: SystemMessageCode,
  ): NotificationType {
    switch (code) {
      case SystemMessageCode.PAYMENT_PENDING:
      case SystemMessageCode.PAYMENT_SUCCEEDED:
      case SystemMessageCode.PAYMENT_FAILED:
      case SystemMessageCode.PAYMENT_CANCELLED:
        return NotificationType.PAYMENT_STATUS_UPDATED;
      case SystemMessageCode.REFUND_REQUESTED:
      case SystemMessageCode.REFUND_SUCCEEDED:
      case SystemMessageCode.REFUND_FAILED:
        return NotificationType.REFUND_STATUS_UPDATED;
      case SystemMessageCode.RIDER_ASSIGNED:
        return NotificationType.ORDER_ASSIGNED;
      case SystemMessageCode.RIDER_ACCEPTED:
      case SystemMessageCode.RIDER_REJECTED_ASSIGNMENT:
      case SystemMessageCode.ORDER_PICKED_UP:
      case SystemMessageCode.ORDER_ON_THE_WAY:
      case SystemMessageCode.ORDER_DELIVERED:
      case SystemMessageCode.FAILED_DELIVERY:
      case SystemMessageCode.MERCHANT_HANDOFF_CONFIRMED:
      case SystemMessageCode.DELIVERY_PROOF_SUBMITTED:
        return NotificationType.DELIVERY_STATUS_UPDATED;
      case SystemMessageCode.ADMIN_INTERVENTION:
        return NotificationType.SUPPORT_UPDATE;
      default:
        return NotificationType.ORDER_STATUS_UPDATED;
    }
  }

  private buildOrderNotificationTitle(
    code: SystemMessageCode,
    orderCode: string,
  ): string {
    switch (code) {
      case SystemMessageCode.PAYMENT_PENDING:
      case SystemMessageCode.PAYMENT_SUCCEEDED:
      case SystemMessageCode.PAYMENT_FAILED:
      case SystemMessageCode.PAYMENT_CANCELLED:
        return `Payment update: ${orderCode}`;
      case SystemMessageCode.REFUND_REQUESTED:
      case SystemMessageCode.REFUND_SUCCEEDED:
      case SystemMessageCode.REFUND_FAILED:
        return `Refund update: ${orderCode}`;
      case SystemMessageCode.RIDER_ASSIGNED:
        return `Rider assigned for ${orderCode}`;
      case SystemMessageCode.ORDER_DELIVERED:
        return `Order delivered: ${orderCode}`;
      case SystemMessageCode.ORDER_CANCELLED:
        return `Order cancelled: ${orderCode}`;
      case SystemMessageCode.ADMIN_INTERVENTION:
        return `Support updated ${orderCode}`;
      default:
        return `Order update: ${orderCode}`;
    }
  }

  private buildConversationMessageTitle(orderCode: string | null): string {
    return orderCode === null
      ? 'New conversation message'
      : `New message for ${orderCode}`;
  }

  private buildConversationMessageBody(
    actorRole: UserRole,
    message: SentMessageEntity,
  ): string {
    if (message.type === 'TEXT') {
      const trimmedBody = message.body.trim();

      return trimmedBody.length > 0
        ? trimmedBody
        : `${this.humanizeRole(actorRole)} sent a message.`;
    }

    switch (message.type) {
      case 'IMAGE':
        return `${this.humanizeRole(actorRole)} sent an image.`;
      case 'FILE':
        return `${this.humanizeRole(actorRole)} sent a file.`;
      case 'PROOF_OF_HANDOFF':
        return `${this.humanizeRole(actorRole)} shared handoff proof.`;
      case 'PROOF_OF_DELIVERY':
        return `${this.humanizeRole(actorRole)} shared delivery proof.`;
      default:
        return `${this.humanizeRole(actorRole)} sent a message.`;
    }
  }

  private buildInventoryAlertTitle(input: {
    resourceLabel: string;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
  }): string {
    return input.attentionLevel === 'OUT_OF_STOCK'
      ? `Out of stock: ${input.resourceLabel}`
      : `Low stock: ${input.resourceLabel}`;
  }

  private buildInventoryAlertBody(input: {
    branchId: string;
    branchName?: string | null;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceLabel: string;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    menuItemName?: string | null;
  }): string {
    const stockText =
      input.stockQuantity === null
        ? 'tracked stock requires attention'
        : `${input.stockQuantity} left`;
    const thresholdText =
      input.lowStockThreshold === null
        ? 'without a configured threshold'
        : `threshold ${input.lowStockThreshold}`;
    const subject =
      input.resourceType === 'ITEM_OPTION' && input.menuItemName
        ? `${input.menuItemName} - ${input.resourceLabel}`
        : input.resourceLabel;
    const branchLabel = input.branchName?.trim() || input.branchId;

    return input.attentionLevel === 'OUT_OF_STOCK'
      ? `${subject} is now out of stock in ${branchLabel}. Current stock: ${stockText}.`
      : `${subject} is now low in ${branchLabel} with ${stockText} (${thresholdText}).`;
  }

  private buildInventoryCompensationTitle(input: {
    resourceLabel: string;
  }): string {
    return `Stock restored: ${input.resourceLabel}`;
  }

  private buildInventoryCompensationBody(
    input: MenuInventoryCompensationEvent & {
      orderCode: string;
      note?: string | null;
    },
  ): string {
    const subject =
      input.resourceType === 'ITEM_OPTION' && input.menuItemName
        ? `${input.menuItemName} - ${input.resourceLabel}`
        : input.resourceLabel;
    const branchLabel = input.branchName?.trim() || input.branchId;
    const stockText =
      input.stockQuantity === null
        ? 'tracked stock updated'
        : `current stock ${input.stockQuantity}`;
    const quantityLabel =
      input.restoredQuantity === 1
        ? '1 reserved unit was'
        : `${input.restoredQuantity} reserved units were`;
    const noteText =
      input.note?.trim() && input.note.trim().length > 0
        ? ` Note: ${input.note.trim()}.`
        : '';

    return `${quantityLabel} restored to ${subject} in ${branchLabel} for ${input.orderCode}; ${stockText}.${noteText}`;
  }

  private async autoResolveRecoveredInventoryAlerts(
    input: MenuInventoryCompensationEvent & {
      orderId: string;
      orderCode: string;
      reasonCode?: string | null;
      note?: string | null;
    },
    compensationNotificationId: string,
  ): Promise<void> {
    const candidateNotifications =
      await this.notificationsRepository.listRecentInventoryAlertsByUserId(
        input.merchantUserId,
      );
    const relatedAttentionAlerts = candidateNotifications
      .map((notification) => ({
        notification,
        metadata: readAdminInventoryAlertMetadata(notification),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          notification: Awaited<
            ReturnType<NotificationsRepository['listRecentInventoryAlertsByUserId']>
          >[number];
          metadata: NonNullable<
            ReturnType<typeof readAdminInventoryAlertMetadata>
          >;
        } =>
          candidate.metadata !== null &&
          candidate.metadata.alertKind === 'ATTENTION' &&
          candidate.metadata.resourceType === input.resourceType &&
          candidate.metadata.resourceId === input.resourceId &&
          this.shouldAutoResolveAttentionAlert(
            candidate.metadata.attentionLevel,
            input.stockQuantity,
            input.lowStockThreshold,
          ),
      );

    if (relatedAttentionAlerts.length === 0) {
      return;
    }

    const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(
      relatedAttentionAlerts.map(({ notification }) => notification.id),
    );
    const latestLifecycleByNotificationId = new Map(
      lifecycleLogs.map((log) => [log.resourceId, log]),
    );

    for (const { notification, metadata } of relatedAttentionAlerts) {
      const currentStatus = this.resolveInventoryAlertStatus(
        latestLifecycleByNotificationId.get(notification.id) ?? null,
      );

      if (
        currentStatus === 'RESOLVED' ||
        currentStatus === 'DISMISSED'
      ) {
        continue;
      }

      await this.auditService.logAction({
        actorType: AuditActorType.SYSTEM,
        actorUserId: null,
        actorRole: null,
        actionSource: AuditActionSource.SYSTEM,
        action: NotificationEventService.inventoryAlertResolutionAction,
        resourceType: AuditResourceType.NOTIFICATION,
        resourceId: notification.id,
        resourceLabel: notification.title,
        targetUserId: notification.user.id,
        branchId: metadata.branchId,
        orderId: input.orderId,
        metadataJson: {
          note: this.buildAutoResolutionNote(
            metadata.attentionLevel!,
            input.orderCode,
            input.stockQuantity,
            input.lowStockThreshold,
          ),
          notificationType: NotificationType.SYSTEM_ALERT,
          alertKind: metadata.alertKind,
          attentionLevel: metadata.attentionLevel,
          resourceType: metadata.resourceType,
          resourceId: metadata.resourceId,
          resourceLabel: metadata.resourceLabel,
          restoredQuantity: input.restoredQuantity,
          orderId: input.orderId,
          orderCode: input.orderCode,
          reasonCode: input.reasonCode ?? null,
          resolutionSource: 'inventory_compensation',
          compensationNotificationId,
          currentStockQuantity: input.stockQuantity,
          currentLowStockThreshold: input.lowStockThreshold,
        },
      });
    }
  }

  private shouldAutoResolveAttentionAlert(
    attentionLevel: AdminInventoryAttentionLevel | null,
    stockQuantity: number | null,
    lowStockThreshold: number | null,
  ): boolean {
    if (attentionLevel === null || stockQuantity === null) {
      return false;
    }

    if (attentionLevel === 'OUT_OF_STOCK') {
      return stockQuantity > 0;
    }

    if (lowStockThreshold === null) {
      return stockQuantity > 0;
    }

    return stockQuantity > lowStockThreshold;
  }

  private buildAutoResolutionNote(
    attentionLevel: AdminInventoryAttentionLevel,
    orderCode: string,
    stockQuantity: number | null,
    lowStockThreshold: number | null,
  ): string {
    if (attentionLevel === 'OUT_OF_STOCK') {
      return stockQuantity === null
        ? `Auto-resolved after stock restoration for ${orderCode}.`
        : `Auto-resolved after stock restoration for ${orderCode}; stock is now ${stockQuantity}.`;
    }

    if (stockQuantity === null || lowStockThreshold === null) {
      return `Auto-resolved after stock restoration for ${orderCode}.`;
    }

    return `Auto-resolved after stock restoration for ${orderCode}; stock is now ${stockQuantity}, above threshold ${lowStockThreshold}.`;
  }

  private resolveInventoryAlertStatus(
    lifecycleLog: {
      action: string;
    } | null,
  ): 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED' {
    switch (lifecycleLog?.action) {
      case NotificationEventService.inventoryAlertDismissalAction:
        return 'DISMISSED';
      case NotificationEventService.inventoryAlertResolutionAction:
        return 'RESOLVED';
      case NotificationEventService.inventoryAlertAcknowledgementAction:
        return 'ACKNOWLEDGED';
      default:
        return 'OPEN';
    }
  }

  private humanizeRole(role: UserRole): string {
    switch (role) {
      case UserRole.CUSTOMER:
        return 'Customer';
      case UserRole.MERCHANT:
        return 'Merchant';
      case UserRole.RIDER:
        return 'Rider';
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.SUPPORT:
        return 'Support';
      default:
        return 'User';
    }
  }

  private async recordDefaultDeliveries(notificationId: string): Promise<void> {
    const now = new Date();

    await this.notificationsService.createDeliveryAttempt({
      notificationId,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.DELIVERED,
      deliveredAt: now,
    });

    await this.notificationsService.createDeliveryAttempt({
      notificationId,
      channel: NotificationChannel.PUSH,
      status: NotificationDeliveryStatus.QUEUED,
      queuedAt: now,
    });

    await this.queueService.add(
      QueueNames.notifications,
      QueueJobNames.notifications.pushNotification,
      {
        notificationId,
        attempt: 1,
      },
    );
  }

  private async recordMerchantInventoryAlertDeliveries(
    notificationId: string,
    merchantUserId: string,
  ): Promise<void> {
    const now = new Date();

    await this.notificationsService.createDeliveryAttempt({
      notificationId,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.DELIVERED,
      deliveredAt: now,
    });

    const shouldQueuePush =
      await this.notificationPreferencesService.shouldQueueMerchantInventoryAlertPush(
        merchantUserId,
        now,
      );

    if (!shouldQueuePush) {
      return;
    }

    await this.notificationsService.createDeliveryAttempt({
      notificationId,
      channel: NotificationChannel.PUSH,
      status: NotificationDeliveryStatus.QUEUED,
      queuedAt: now,
    });

    await this.queueService.add(
      QueueNames.notifications,
      QueueJobNames.notifications.pushNotification,
      {
        notificationId,
        attempt: 1,
      },
    );
  }
}
