import {
  ConversationParticipantRole,
  ConversationType,
  MessageType,
  SystemMessageCode,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../../../../src/modules/messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../../../src/modules/messaging/entities/sent-message.entity';
import { NotificationsRepository } from '../../../../src/modules/notifications/repositories/notifications.repository';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { NotificationPreferencesService } from '../../../../src/modules/notifications/services/notification-preferences.service';
import { NotificationsService } from '../../../../src/modules/notifications/services/notifications.service';

function makeCurrentUser(): AuthenticatedUserEntity {
  return {
    userId: 'usr_customer_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_customer_1',
      phone: '091111111',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  };
}

function makeOrder(): ConversationOrderContextEntity {
  return {
    orderId: 'order_1',
    orderCode: 'ORD-001',
    status: 'PLACED',
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_customer_1',
    },
    merchant: {
      merchantId: 'merchant_1',
      userId: 'usr_merchant_1',
      merchantName: 'Demo Merchant',
    },
    branch: {
      branchName: 'Downtown Branch',
    },
    rider: null,
  };
}

function makeConversation(): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.ORDER_CHAT,
    title: 'Order Chat',
    lastMessageId: null,
    lastMessageAt: null,
    createdAt: '2026-04-23T10:00:00.000Z',
    updatedAt: '2026-04-23T10:00:00.000Z',
    participants: [
      {
        participantKey: 'user:usr_customer_1',
        userId: 'usr_customer_1',
        roleAtJoin: ConversationParticipantRole.CUSTOMER,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: false,
        canModerate: false,
        joinedAt: '2026-04-23T10:00:00.000Z',
        leftAt: null,
      },
      {
        participantKey: 'user:usr_merchant_1',
        userId: 'usr_merchant_1',
        roleAtJoin: ConversationParticipantRole.MERCHANT,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: true,
        canModerate: false,
        joinedAt: '2026-04-23T10:00:00.000Z',
        leftAt: null,
      },
    ],
  };
}

function makeMessage(overrides?: Partial<SentMessageEntity>): SentMessageEntity {
  return {
    messageId: 'msg_1',
    conversationId: 'con_1',
    senderKind: 'USER',
    senderId: 'usr_customer_1',
    type: MessageType.TEXT,
    systemEventCode: null,
    body: 'Hello from chat.',
    metadataJson: null,
    deletedAt: null,
    createdAt: '2026-04-23T10:01:00.000Z',
    receipts: [],
    attachments: [],
    ...overrides,
  };
}

function makeDependencies() {
  const notificationsService = {
    hasRecentMerchantInventoryAlert: jest.fn().mockResolvedValue(false),
    createNotification: jest.fn(),
    createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<NotificationsService>;
  const notificationPreferencesService = {
    shouldQueueMerchantInventoryAlertPush: jest.fn().mockResolvedValue(true),
  } as unknown as jest.Mocked<NotificationPreferencesService>;
  const queueService = {
    add: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<QueueService>;
  const notificationsRepository = {
    listRecentInventoryAlertsByUserId: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<NotificationsRepository>;
  const auditService = {
    listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([]),
    logAction: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<AuditService>;
  const service = new NotificationEventService(
    notificationsService,
    notificationPreferencesService,
    queueService,
    notificationsRepository,
    auditService,
  );

  return {
    notificationsService,
    notificationPreferencesService,
    queueService,
    notificationsRepository,
    auditService,
    service,
  };
}

describe('NotificationEventService', () => {
  it('publishes order event notifications for non-actor participants', async () => {
    const { notificationsService, queueService, service } = makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_1',
    } as never);

    await service.publishOrderEvent({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: makeMessage({
        senderKind: 'SYSTEM',
        senderId: null,
        type: MessageType.SYSTEM_EVENT,
        systemEventCode: SystemMessageCode.ORDER_ACCEPTED,
        body: 'Merchant accepted your order.',
      }),
      code: SystemMessageCode.ORDER_ACCEPTED,
    });

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'usr_merchant_1',
        title: 'Order update: ORD-001',
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenCalledTimes(2);
    expect(queueService.add).toHaveBeenCalled();
  });

  it('publishes conversation message notifications with a friendly fallback body', async () => {
    const { notificationsService, service } = makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_2',
    } as never);

    await service.publishConversationMessage({
      currentUser: {
        ...makeCurrentUser(),
        role: UserRole.RIDER,
      },
      order: makeOrder(),
      conversation: makeConversation(),
      message: makeMessage({
        type: MessageType.PROOF_OF_DELIVERY,
        body: '',
      }),
    });

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MESSAGE_RECEIVED',
        body: 'Rider shared delivery proof.',
      }),
    );
  });

  it('maps payment system events to payment-status notifications', async () => {
    const { notificationsService, service } = makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_3',
    } as never);

    await service.publishOrderEvent({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: makeMessage({
        senderKind: 'SYSTEM',
        senderId: null,
        type: MessageType.SYSTEM_EVENT,
        systemEventCode: SystemMessageCode.PAYMENT_FAILED,
        body: 'Payment failed.',
      }),
      code: SystemMessageCode.PAYMENT_FAILED,
    });

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'PAYMENT_STATUS_UPDATED',
        title: 'Payment update: ORD-001',
      }),
    );
  });

  it('maps refund system events to refund-status notifications', async () => {
    const { notificationsService, service } = makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_4',
    } as never);

    await service.publishOrderEvent({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: makeMessage({
        senderKind: 'SYSTEM',
        senderId: null,
        type: MessageType.SYSTEM_EVENT,
        systemEventCode: SystemMessageCode.REFUND_SUCCEEDED,
        body: 'Refund completed.',
      }),
      code: SystemMessageCode.REFUND_SUCCEEDED,
    });

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'REFUND_STATUS_UPDATED',
        title: 'Refund update: ORD-001',
      }),
    );
  });

  it('publishes merchant inventory alerts as system notifications', async () => {
    const {
      notificationsService,
      notificationPreferencesService,
      queueService,
      notificationsRepository,
      auditService,
      service,
    } =
      makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_5',
    } as never);

    await service.publishMerchantInventoryAlert({
      merchantUserId: 'usr_merchant_1',
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      resourceType: 'ITEM_OPTION',
      resourceId: 'option_1',
      resourceLabel: 'Extra fish cake',
      attentionLevel: 'OUT_OF_STOCK',
      stockQuantity: 0,
      lowStockThreshold: 2,
      menuItemName: 'Mohinga',
    });

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'usr_merchant_1',
        type: 'SYSTEM_ALERT',
        title: 'Out of stock: Extra fish cake',
        navigationPath: '/merchant/branches/branch_1/inventory/overview',
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenCalledTimes(2);
    expect(
      notificationPreferencesService.shouldQueueMerchantInventoryAlertPush,
    ).toHaveBeenCalledWith('usr_merchant_1', expect.any(Date));
    expect(queueService.add).toHaveBeenCalled();
    expect(notificationsRepository.listRecentInventoryAlertsByUserId).not.toHaveBeenCalled();
    expect(auditService.logAction).not.toHaveBeenCalled();
  });

  it('suppresses duplicate merchant inventory alerts within the cooldown window', async () => {
    const { notificationsService, queueService, service } = makeDependencies();
    notificationsService.hasRecentMerchantInventoryAlert.mockResolvedValue(true);

    await service.publishMerchantInventoryAlert({
      merchantUserId: 'usr_merchant_1',
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      resourceType: 'MENU_ITEM',
      resourceId: 'item_1',
      resourceLabel: 'Mohinga',
      attentionLevel: 'LOW_STOCK',
      stockQuantity: 2,
      lowStockThreshold: 3,
    });

    expect(notificationsService.createNotification).not.toHaveBeenCalled();
    expect(notificationsService.createDeliveryAttempt).not.toHaveBeenCalled();
    expect(queueService.add).not.toHaveBeenCalled();
  });

  it('publishes merchant inventory compensation alerts after stock restoration', async () => {
    const {
      notificationsService,
      notificationPreferencesService,
      queueService,
      notificationsRepository,
      auditService,
      service,
    } =
      makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_6',
    } as never);

    await service.publishMerchantInventoryCompensationAlert({
      merchantUserId: 'usr_merchant_1',
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      resourceType: 'MENU_ITEM',
      resourceId: 'item_1',
      resourceLabel: 'Mohinga',
      restoredQuantity: 2,
      stockQuantity: 5,
      lowStockThreshold: 3,
      orderId: 'order_1',
      orderCode: 'ORD-001',
      reasonCode: 'payment_failed',
      note: 'Customer should retry later.',
    });

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'usr_merchant_1',
        type: 'SYSTEM_ALERT',
        title: 'Stock restored: Mohinga',
        orderId: 'order_1',
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenCalledTimes(2);
    expect(
      notificationPreferencesService.shouldQueueMerchantInventoryAlertPush,
    ).toHaveBeenCalledWith('usr_merchant_1', expect.any(Date));
    expect(queueService.add).toHaveBeenCalled();
    expect(notificationsRepository.listRecentInventoryAlertsByUserId).toHaveBeenCalledWith(
      'usr_merchant_1',
    );
    expect(auditService.logAction).not.toHaveBeenCalled();
  });

  it('keeps merchant inventory alerts in-app only when push delivery is disabled', async () => {
    const {
      notificationsService,
      notificationPreferencesService,
      queueService,
      service,
    } = makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_7',
    } as never);
    notificationPreferencesService.shouldQueueMerchantInventoryAlertPush.mockResolvedValue(
      false,
    );

    await service.publishMerchantInventoryAlert({
      merchantUserId: 'usr_merchant_1',
      branchId: 'branch_1',
      resourceType: 'MENU_ITEM',
      resourceId: 'item_1',
      resourceLabel: 'Mohinga',
      attentionLevel: 'LOW_STOCK',
      stockQuantity: 2,
      lowStockThreshold: 3,
    });

    expect(notificationsService.createDeliveryAttempt).toHaveBeenCalledTimes(1);
    expect(notificationsService.createDeliveryAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: 'notification_7',
        channel: 'IN_APP',
      }),
    );
    expect(queueService.add).not.toHaveBeenCalled();
  });

  it('auto-resolves related shortage alerts when compensation clears the shortage state', async () => {
    const { notificationsService, notificationsRepository, auditService, service } =
      makeDependencies();
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_comp_1',
    } as never);
    notificationsRepository.listRecentInventoryAlertsByUserId.mockResolvedValue([
      {
        id: 'notification_low_1',
        userId: 'usr_merchant_1',
        type: 'SYSTEM_ALERT',
        title: 'Low stock: Mohinga',
        body: 'Mohinga is now low.',
        navigationPath: '/merchant/branches/branch_1/inventory/overview',
        metadataJson: {
          alertKind: 'ATTENTION',
          branchId: 'branch_1',
          branchName: 'Downtown Branch',
          resourceType: 'MENU_ITEM',
          resourceId: 'item_1',
          resourceLabel: 'Mohinga',
          attentionLevel: 'LOW_STOCK',
          stockQuantity: 2,
          lowStockThreshold: 3,
        },
        readAt: null,
        orderId: null,
        deliveryId: null,
        conversationId: null,
        messageId: null,
        createdAt: new Date('2026-05-01T10:00:00.000Z'),
        updatedAt: new Date('2026-05-01T10:00:00.000Z'),
        user: {
          id: 'usr_merchant_1',
          role: UserRole.MERCHANT,
          phone: '0999999999',
        },
      } as never,
      {
        id: 'notification_out_1',
        userId: 'usr_merchant_1',
        type: 'SYSTEM_ALERT',
        title: 'Out of stock: Mohinga',
        body: 'Mohinga is now out of stock.',
        navigationPath: '/merchant/branches/branch_1/inventory/overview',
        metadataJson: {
          alertKind: 'ATTENTION',
          branchId: 'branch_1',
          branchName: 'Downtown Branch',
          resourceType: 'MENU_ITEM',
          resourceId: 'item_1',
          resourceLabel: 'Mohinga',
          attentionLevel: 'OUT_OF_STOCK',
          stockQuantity: 0,
          lowStockThreshold: 3,
        },
        readAt: null,
        orderId: null,
        deliveryId: null,
        conversationId: null,
        messageId: null,
        createdAt: new Date('2026-05-01T10:02:00.000Z'),
        updatedAt: new Date('2026-05-01T10:02:00.000Z'),
        user: {
          id: 'usr_merchant_1',
          role: UserRole.MERCHANT,
          phone: '0999999999',
        },
      } as never,
    ]);
    auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
      {
        action: 'inventory_alerts.acknowledged',
        resourceId: 'notification_low_1',
        metadata: {
          note: 'Already triaged.',
        },
        actorUser: {
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
          phone: '099999999',
        },
        createdAt: '2026-05-01T10:10:00.000Z',
      },
      {
        action: 'inventory_alerts.dismissed',
        resourceId: 'notification_out_1',
        metadata: {
          note: 'Noise only.',
        },
        actorUser: {
          userId: 'usr_admin_2',
          role: UserRole.ADMIN,
          phone: '098888888',
        },
        createdAt: '2026-05-01T10:12:00.000Z',
      },
    ] as never);

    await service.publishMerchantInventoryCompensationAlert({
      merchantUserId: 'usr_merchant_1',
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      resourceType: 'MENU_ITEM',
      resourceId: 'item_1',
      resourceLabel: 'Mohinga',
      restoredQuantity: 3,
      stockQuantity: 5,
      lowStockThreshold: 3,
      orderId: 'order_1',
      orderCode: 'ORD-001',
      reasonCode: 'payment_failed',
    });

    expect(auditService.logAction).toHaveBeenCalledTimes(1);
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actorType: 'SYSTEM',
        actionSource: 'SYSTEM',
        action: 'inventory_alerts.resolved',
        resourceType: 'NOTIFICATION',
        resourceId: 'notification_low_1',
        orderId: 'order_1',
        metadataJson: expect.objectContaining({
          resolutionSource: 'inventory_compensation',
          compensationNotificationId: 'notification_comp_1',
          orderCode: 'ORD-001',
        }),
      }),
    );
  });
});
