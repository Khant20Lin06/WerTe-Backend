import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import {
  AdminInventoryAlertKind,
  AdminInventoryAlertStatus,
} from '../../../../src/modules/notifications/dto/admin-inventory-alert.dto';
import { AdminReportsService } from '../../../../src/modules/reports/services/admin-reports.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AdminReportsService', () => {
  const currentUser = makeAuthenticatedUser({
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-02T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const makeNotification = (overrides?: Record<string, unknown>) => ({
    id: 'notification_1',
    userId: 'usr_merchant_1',
    type: NotificationType.SYSTEM_ALERT,
    readAt: null,
    createdAt: new Date('2026-05-02T09:00:00.000Z'),
    metadataJson: {
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      resourceType: 'MENU_ITEM',
      resourceId: 'item_1',
      resourceLabel: 'Mohinga',
      attentionLevel: 'LOW_STOCK',
      stockQuantity: 2,
      lowStockThreshold: 3,
      menuItemName: null,
    },
    deliveries: [
      {
        channel: NotificationChannel.PUSH,
        status: NotificationDeliveryStatus.SENT,
      },
    ],
    ...overrides,
  });

  it('builds an inventory alert overview snapshot with lifecycle and delivery aggregates', async () => {
    const prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([
          makeNotification(),
          makeNotification({
            id: 'notification_2',
            userId: 'usr_merchant_2',
            readAt: new Date('2026-05-02T10:00:00.000Z'),
            createdAt: new Date('2026-05-02T10:00:00.000Z'),
            metadataJson: {
              alertKind: AdminInventoryAlertKind.COMPENSATION,
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
              menuItemName: null,
            },
            deliveries: [
              {
                channel: NotificationChannel.PUSH,
                status: NotificationDeliveryStatus.DELIVERED,
              },
            ],
          }),
          makeNotification({
            id: 'notification_3',
            userId: 'usr_merchant_3',
            createdAt: new Date('2026-05-01T08:00:00.000Z'),
            metadataJson: {
              branchId: 'branch_2',
              branchName: 'North Branch',
              resourceType: 'ITEM_OPTION',
              resourceId: 'option_1',
              resourceLabel: 'Extra fish cake',
              attentionLevel: 'OUT_OF_STOCK',
              stockQuantity: 0,
              lowStockThreshold: 1,
              menuItemName: 'Mohinga',
            },
            deliveries: [
              {
                channel: NotificationChannel.PUSH,
                status: NotificationDeliveryStatus.FAILED,
              },
            ],
          }),
        ]),
      },
    } as unknown as jest.Mocked<PrismaService>;
    const auditService = {
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.acknowledged',
          resourceId: 'notification_1',
          createdAt: '2026-05-02T09:30:00.000Z',
        },
        {
          action: 'inventory_alerts.resolved',
          resourceId: 'notification_2',
          createdAt: '2026-05-02T11:00:00.000Z',
        },
        {
          action: 'inventory_alerts.dismissed',
          resourceId: 'notification_3',
          createdAt: '2026-05-01T09:00:00.000Z',
        },
      ]),
      listInventoryAlertFollowUpLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.reminder_sent',
          resourceId: 'notification_1',
          createdAt: '2026-05-02T09:45:00.000Z',
        },
        {
          action: 'inventory_alerts.escalated',
          resourceId: 'notification_3',
          createdAt: '2026-05-01T10:00:00.000Z',
        },
      ]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminReportsService(prisma, auditService);

    const result = await service.getInventoryAlertOverview(currentUser, {
      days: 7,
    });

    expect(result).toMatchObject({
      periodDays: 7,
      totalAlertsCount: 3,
      unreadMerchantAlertsCount: 2,
      kindCounts: {
        attentionAlertsCount: 2,
        compensationAlertsCount: 1,
      },
      statusCounts: {
        openAlertsCount: 0,
        acknowledgedAlertsCount: 1,
        resolvedAlertsCount: 1,
        dismissedAlertsCount: 1,
      },
      attentionLevelCounts: {
        lowStockAlertsCount: 1,
        outOfStockAlertsCount: 1,
      },
      resourceTypeCounts: {
        menuItemAlertsCount: 2,
        itemOptionAlertsCount: 1,
      },
      followUpCounts: {
        reminderCount: 1,
        escalationCount: 1,
      },
      deliveryCounts: {
        pushPendingCount: 0,
        pushQueuedCount: 0,
        pushSentCount: 1,
        pushDeliveredCount: 1,
        pushFailedCount: 1,
      },
    });
    expect(result.topBranches).toEqual([
      expect.objectContaining({
        branchId: 'branch_1',
        totalAlertsCount: 2,
        openLifecycleAlertsCount: 1,
      }),
      expect.objectContaining({
        branchId: 'branch_2',
        escalatedAlertsCount: 1,
      }),
    ]);
  });

  it('builds per-day inventory alert trends for created and lifecycle events', async () => {
    const prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([
          makeNotification({
            id: 'notification_1',
            createdAt: new Date('2026-05-01T08:00:00.000Z'),
          }),
          makeNotification({
            id: 'notification_2',
            createdAt: new Date('2026-05-02T08:00:00.000Z'),
            metadataJson: {
              alertKind: AdminInventoryAlertKind.COMPENSATION,
              branchId: 'branch_1',
              branchName: 'Downtown Branch',
              resourceType: 'MENU_ITEM',
              resourceId: 'item_1',
              resourceLabel: 'Mohinga',
              restoredQuantity: 1,
              stockQuantity: 4,
              lowStockThreshold: 3,
              orderId: 'order_1',
              orderCode: 'ORD-001',
              reasonCode: 'payment_failed',
              menuItemName: null,
            },
          }),
        ]),
      },
    } as unknown as jest.Mocked<PrismaService>;
    const auditService = {
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.acknowledged',
          resourceId: 'notification_1',
          createdAt: '2026-05-01T09:00:00.000Z',
        },
        {
          action: 'inventory_alerts.resolved',
          resourceId: 'notification_2',
          createdAt: '2026-05-02T09:30:00.000Z',
        },
      ]),
      listInventoryAlertFollowUpLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.reminder_sent',
          resourceId: 'notification_1',
          createdAt: '2026-05-01T11:00:00.000Z',
        },
        {
          action: 'inventory_alerts.escalated',
          resourceId: 'notification_2',
          createdAt: '2026-05-02T12:00:00.000Z',
        },
      ]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminReportsService(prisma, auditService);

    const result = await service.getInventoryAlertTrends(currentUser, {
      days: 2,
    });

    expect(result.buckets).toEqual([
      expect.objectContaining({
        date: '2026-05-01',
        createdAlertsCount: 1,
        attentionAlertsCount: 1,
        compensationAlertsCount: 0,
        acknowledgedCount: 1,
        reminderCount: 1,
      }),
      expect.objectContaining({
        date: '2026-05-02',
        createdAlertsCount: 1,
        attentionAlertsCount: 0,
        compensationAlertsCount: 1,
        resolvedCount: 1,
        escalationCount: 1,
      }),
    ]);
  });
});
