import {
  NotificationChannel,
  NotificationDeliveryStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { NotificationsRepository } from '../../../../src/modules/notifications/repositories/notifications.repository';
import { NotificationAlertDigestService } from '../../../../src/modules/notifications/services/notification-alert-digest.service';
import { NotificationPreferencesService } from '../../../../src/modules/notifications/services/notification-preferences.service';
import { NotificationsService } from '../../../../src/modules/notifications/services/notifications.service';
import { UsersService } from '../../../../src/modules/users/services/users.service';

function makeAttentionAlert(input: {
  notificationId: string;
  merchantUserId: string;
  merchantPhone?: string;
  branchId?: string;
  branchName?: string;
  resourceId?: string;
  resourceLabel?: string;
  attentionLevel?: 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockQuantity?: number;
  lowStockThreshold?: number;
  createdAt: string;
}) {
  return {
    id: input.notificationId,
    userId: input.merchantUserId,
    type: 'SYSTEM_ALERT',
    title: `Low stock: ${input.resourceLabel ?? 'Mohinga'}`,
    body: 'Shortage detected.',
    navigationPath: '/merchant/branches/branch_1/inventory/overview',
    metadataJson: {
      alertKind: 'ATTENTION',
      branchId: input.branchId ?? 'branch_1',
      branchName: input.branchName ?? 'Downtown Branch',
      resourceType: 'MENU_ITEM',
      resourceId: input.resourceId ?? 'item_1',
      resourceLabel: input.resourceLabel ?? 'Mohinga',
      attentionLevel: input.attentionLevel ?? 'LOW_STOCK',
      stockQuantity: input.stockQuantity ?? 2,
      lowStockThreshold: input.lowStockThreshold ?? 3,
      menuItemName: null,
    },
    readAt: null,
    orderId: null,
    deliveryId: null,
    conversationId: null,
    messageId: null,
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.createdAt),
    user: {
      id: input.merchantUserId,
      role: UserRole.MERCHANT,
      phone: input.merchantPhone ?? '0999999999',
    },
  } as never;
}

function makeAuditLog(input: {
  action: string;
  resourceId: string;
  createdAt: string;
}) {
  return {
    action: input.action,
    resourceId: input.resourceId,
    createdAt: input.createdAt,
    metadata: null,
    actorUser: null,
  } as never;
}

describe('NotificationAlertDigestService', () => {
  function makeDependencies() {
    const notificationsRepository = {
      listRecentInventoryAlerts: jest.fn(),
    } as unknown as jest.Mocked<NotificationsRepository>;
    const notificationsService = {
      createNotification: jest.fn(),
      createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {
      shouldQueueMerchantInventoryAlertPush: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<NotificationPreferencesService>;
    const queueService = {
      add: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueueService>;
    const auditService = {
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([]),
      listInventoryAlertFollowUpLogs: jest.fn().mockResolvedValue([]),
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    const usersService = {
      listActiveByRoles: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<UsersService>;
    const logger = {
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;

    const service = new NotificationAlertDigestService(
      notificationsRepository,
      notificationsService,
      notificationPreferencesService,
      queueService,
      auditService,
      usersService,
      logger,
    );

    return {
      notificationsRepository,
      notificationsService,
      notificationPreferencesService,
      queueService,
      auditService,
      usersService,
      logger,
      service,
    };
  }

  it('creates a merchant reminder digest and queues push when unresolved alerts age past the reminder threshold', async () => {
    const {
      notificationsRepository,
      notificationsService,
      queueService,
      auditService,
      usersService,
      service,
    } = makeDependencies();
    notificationsRepository.listRecentInventoryAlerts.mockResolvedValue([
      makeAttentionAlert({
        notificationId: 'notification_1',
        merchantUserId: 'usr_merchant_1',
        resourceLabel: 'Mohinga',
        createdAt: '2026-05-02T11:10:00.000Z',
      }),
    ]);
    notificationsService.createNotification.mockResolvedValue({
      notificationId: 'notification_digest_1',
    } as never);

    const result = await service.runDigestCycle(
      new Date('2026-05-02T12:00:00.000Z'),
    );

    expect(notificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'usr_merchant_1',
        type: 'SUPPORT_UPDATE',
        title: 'Inventory reminder: Downtown Branch',
        navigationPath: '/merchant/branches/branch_1/inventory/overview',
        metadataJson: expect.objectContaining({
          digestKind: 'MERCHANT_INVENTORY_REMINDER',
          attentionAlertCount: 1,
        }),
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        notificationId: 'notification_digest_1',
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.DELIVERED,
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        notificationId: 'notification_digest_1',
        channel: NotificationChannel.PUSH,
        status: NotificationDeliveryStatus.QUEUED,
      }),
    );
    expect(queueService.add).toHaveBeenCalledWith(
      'notifications',
      'push-notification',
      {
        notificationId: 'notification_digest_1',
        attempt: 1,
      },
    );
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'inventory_alerts.reminder_sent',
        resourceId: 'notification_1',
      }),
    );
    expect(usersService.listActiveByRoles).not.toHaveBeenCalled();
    expect(result).toEqual({
      attentionAlertsScanned: 1,
      merchantReminderDigestCount: 1,
      reminderSourceAlertCount: 1,
      adminEscalationDigestCount: 0,
      escalationSourceAlertCount: 0,
    });
  });

  it('creates admin escalation notifications for old unresolved alerts when no recent escalation exists', async () => {
    const {
      notificationsRepository,
      notificationsService,
      notificationPreferencesService,
      auditService,
      usersService,
      service,
    } = makeDependencies();
    notificationsRepository.listRecentInventoryAlerts.mockResolvedValue([
      makeAttentionAlert({
        notificationId: 'notification_1',
        merchantUserId: 'usr_merchant_1',
        createdAt: '2026-05-02T08:30:00.000Z',
      }),
    ]);
    auditService.listInventoryAlertFollowUpLogs.mockResolvedValue([
      makeAuditLog({
        action: 'inventory_alerts.reminder_sent',
        resourceId: 'notification_1',
        createdAt: '2026-05-02T09:30:00.000Z',
      }),
    ] as never);
    usersService.listActiveByRoles.mockResolvedValue([
      {
        id: 'usr_admin_1',
        phone: '091111111',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        id: 'usr_support_1',
        phone: '092222222',
        role: UserRole.SUPPORT,
        status: UserStatus.ACTIVE,
      },
    ] as never);
    notificationsService.createNotification
      .mockResolvedValueOnce({
        notificationId: 'notification_admin_1',
      } as never)
      .mockResolvedValueOnce({
        notificationId: 'notification_support_1',
      } as never);

    const result = await service.runDigestCycle(
      new Date('2026-05-02T12:00:00.000Z'),
    );

    expect(notificationPreferencesService.shouldQueueMerchantInventoryAlertPush).not.toHaveBeenCalled();
    expect(usersService.listActiveByRoles).toHaveBeenCalledWith([
      UserRole.ADMIN,
      UserRole.SUPPORT,
    ]);
    expect(notificationsService.createNotification).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        userId: 'usr_admin_1',
        type: 'SUPPORT_UPDATE',
        title: 'Inventory escalation: Downtown Branch',
      }),
    );
    expect(notificationsService.createNotification).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        userId: 'usr_support_1',
        type: 'SUPPORT_UPDATE',
        title: 'Inventory escalation: Downtown Branch',
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        notificationId: 'notification_admin_1',
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.DELIVERED,
      }),
    );
    expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        notificationId: 'notification_support_1',
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.DELIVERED,
      }),
    );
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'inventory_alerts.escalated',
        resourceId: 'notification_1',
        metadataJson: expect.objectContaining({
          recipientCount: 2,
        }),
      }),
    );
    expect(result).toEqual({
      attentionAlertsScanned: 1,
      merchantReminderDigestCount: 0,
      reminderSourceAlertCount: 0,
      adminEscalationDigestCount: 2,
      escalationSourceAlertCount: 1,
    });
  });

  it('skips resolved alerts and alerts with recent follow-up logs', async () => {
    const {
      notificationsRepository,
      notificationsService,
      queueService,
      auditService,
      usersService,
      service,
    } = makeDependencies();
    notificationsRepository.listRecentInventoryAlerts.mockResolvedValue([
      makeAttentionAlert({
        notificationId: 'notification_1',
        merchantUserId: 'usr_merchant_1',
        createdAt: '2026-05-02T09:00:00.000Z',
      }),
    ]);
    auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
      makeAuditLog({
        action: 'inventory_alerts.resolved',
        resourceId: 'notification_1',
        createdAt: '2026-05-02T10:00:00.000Z',
      }),
    ] as never);

    const result = await service.runDigestCycle(
      new Date('2026-05-02T12:00:00.000Z'),
    );

    expect(notificationsService.createNotification).not.toHaveBeenCalled();
    expect(notificationsService.createDeliveryAttempt).not.toHaveBeenCalled();
    expect(queueService.add).not.toHaveBeenCalled();
    expect(auditService.logAction).not.toHaveBeenCalled();
    expect(usersService.listActiveByRoles).not.toHaveBeenCalled();
    expect(result).toEqual({
      attentionAlertsScanned: 1,
      merchantReminderDigestCount: 0,
      reminderSourceAlertCount: 0,
      adminEscalationDigestCount: 0,
      escalationSourceAlertCount: 0,
    });
  });
});
