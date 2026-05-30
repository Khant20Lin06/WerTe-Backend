import { NotificationType, UserRole, UserStatus } from '@prisma/client';

import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import {
  AdminInventoryAlertKind,
  AdminInventoryAlertStatus,
} from '../../../../src/modules/notifications/dto/admin-inventory-alert.dto';
import { AdminInventoryAlertsService } from '../../../../src/modules/notifications/services/admin-inventory-alerts.service';
import { NotificationsRepository } from '../../../../src/modules/notifications/repositories/notifications.repository';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('AdminInventoryAlertsService', () => {
  const currentUser = makeAuthenticatedUser({
    role: UserRole.ADMIN,
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const makeInventoryAlertNotification = (overrides?: Record<string, unknown>) => ({
    id: 'notification_1',
    userId: 'usr_merchant_1',
    type: NotificationType.SYSTEM_ALERT,
    title: 'Low stock: Mohinga',
    body: 'Mohinga is now low in Downtown Branch with 2 left (threshold 3).',
    navigationPath: '/merchant/branches/branch_1/inventory/overview',
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
    ...overrides,
  });

  it('lists admin inventory alerts with acknowledgement state', async () => {
    const notificationsRepository = {
      listRecentInventoryAlerts: jest.fn().mockResolvedValue([
        makeInventoryAlertNotification(),
        makeInventoryAlertNotification({
          id: 'notification_2',
          title: 'Out of stock: Extra fish cake',
          metadataJson: {
            branchId: 'branch_1',
            branchName: 'Downtown Branch',
            resourceType: 'ITEM_OPTION',
            resourceId: 'option_1',
            resourceLabel: 'Extra fish cake',
            attentionLevel: 'OUT_OF_STOCK',
            stockQuantity: 0,
            lowStockThreshold: 2,
            menuItemName: 'Mohinga',
          },
        }),
      ]),
    } as unknown as jest.Mocked<NotificationsRepository>;
    const auditService = {
      listInventoryAlertAcknowledgementLogs: jest.fn().mockResolvedValue([
        {
          resourceId: 'notification_1',
          metadata: {
            note: 'Merchant contacted.',
          },
          actorUser: {
            userId: 'usr_admin_1',
            role: UserRole.ADMIN,
            phone: '099999999',
          },
          createdAt: '2026-05-01T10:15:00.000Z',
        },
      ]),
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.acknowledged',
          resourceId: 'notification_1',
          metadata: {
            note: 'Merchant contacted.',
          },
          actorUser: {
            userId: 'usr_admin_1',
            role: UserRole.ADMIN,
            phone: '099999999',
          },
          createdAt: '2026-05-01T10:15:00.000Z',
        },
      ]),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminInventoryAlertsService(
      notificationsRepository,
      auditService,
    );

    const result = await service.listInventoryAlerts(currentUser, {
      limit: 20,
      status: 'ALL',
    });

    expect(result).toEqual([
      expect.objectContaining({
        notificationId: 'notification_1',
        alertKind: AdminInventoryAlertKind.ATTENTION,
        status: AdminInventoryAlertStatus.ACKNOWLEDGED,
        acknowledgementNote: 'Merchant contacted.',
        statusNote: 'Merchant contacted.',
      }),
      expect.objectContaining({
        notificationId: 'notification_2',
        alertKind: AdminInventoryAlertKind.ATTENTION,
        status: AdminInventoryAlertStatus.OPEN,
        menuItemName: 'Mohinga',
      }),
    ]);
  });

  it('acknowledges an open admin inventory alert through the audit service', async () => {
    const notificationsRepository = {
      findInventoryAlertsByIds: jest
        .fn()
        .mockResolvedValue([makeInventoryAlertNotification()]),
    } as unknown as jest.Mocked<NotificationsRepository>;
    const auditService = {
      listInventoryAlertAcknowledgementLogs: jest.fn().mockResolvedValue([]),
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([]),
      logAction: jest.fn().mockResolvedValue({
        action: 'inventory_alerts.acknowledged',
        resourceId: 'notification_1',
        metadata: {
          note: 'Investigating with merchant.',
        },
        actorUser: {
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
          phone: '099999999',
        },
        createdAt: '2026-05-01T10:20:00.000Z',
      }),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminInventoryAlertsService(
      notificationsRepository,
      auditService,
    );

    const result = await service.acknowledgeInventoryAlert(currentUser, 'notification_1', {
      note: 'Investigating with merchant.',
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'inventory_alerts.acknowledged',
        resourceType: 'NOTIFICATION',
        resourceId: 'notification_1',
      }),
    );
    expect(result).toMatchObject({
      notificationId: 'notification_1',
      alertKind: AdminInventoryAlertKind.ATTENTION,
      status: AdminInventoryAlertStatus.ACKNOWLEDGED,
      acknowledgementNote: 'Investigating with merchant.',
      statusNote: 'Investigating with merchant.',
    });
  });

  it('bulk acknowledges open alerts and returns compensation alert metadata', async () => {
    const notificationsRepository = {
      findInventoryAlertsByIds: jest.fn().mockResolvedValue([
        makeInventoryAlertNotification(),
        makeInventoryAlertNotification({
          id: 'notification_2',
          title: 'Stock restored: Mohinga',
          body: '2 reserved units were restored to Mohinga in Downtown Branch for ORD-001; current stock 5.',
          orderId: 'order_1',
          metadataJson: {
            alertKind: 'COMPENSATION',
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
        }),
      ]),
    } as unknown as jest.Mocked<NotificationsRepository>;
    const auditService = {
      listInventoryAlertAcknowledgementLogs: jest.fn().mockResolvedValue([
        {
          resourceId: 'notification_2',
          metadata: {
            note: 'Already reviewed.',
          },
          actorUser: {
            userId: 'usr_admin_existing',
            role: UserRole.ADMIN,
            phone: '098888888',
          },
          createdAt: '2026-05-01T10:05:00.000Z',
        },
      ]),
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.acknowledged',
          resourceId: 'notification_2',
          metadata: {
            note: 'Already reviewed.',
          },
          actorUser: {
            userId: 'usr_admin_existing',
            role: UserRole.ADMIN,
            phone: '098888888',
          },
          createdAt: '2026-05-01T10:05:00.000Z',
        },
      ]),
      logAction: jest.fn().mockResolvedValue({
        action: 'inventory_alerts.acknowledged',
        resourceId: 'notification_1',
        metadata: {
          note: 'Bulk-reviewed.',
        },
        actorUser: {
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
          phone: '099999999',
        },
        createdAt: '2026-05-01T10:20:00.000Z',
      }),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminInventoryAlertsService(
      notificationsRepository,
      auditService,
    );

    const result = await service.bulkAcknowledgeInventoryAlerts(currentUser, {
      notificationIds: ['notification_1', 'notification_2'],
      note: 'Bulk-reviewed.',
    });

    expect(result).toMatchObject({
      acknowledgedCount: 1,
      alerts: [
        expect.objectContaining({
          notificationId: 'notification_1',
          alertKind: AdminInventoryAlertKind.ATTENTION,
          status: AdminInventoryAlertStatus.ACKNOWLEDGED,
          statusNote: 'Bulk-reviewed.',
        }),
        expect.objectContaining({
          notificationId: 'notification_2',
          alertKind: AdminInventoryAlertKind.COMPENSATION,
          restoredQuantity: 2,
          orderCode: 'ORD-001',
          reasonCode: 'payment_failed',
          status: AdminInventoryAlertStatus.ACKNOWLEDGED,
          statusNote: 'Already reviewed.',
        }),
      ],
    });
  });

  it('resolves an acknowledged alert and returns lifecycle status metadata', async () => {
    const notificationsRepository = {
      findInventoryAlertsByIds: jest
        .fn()
        .mockResolvedValue([makeInventoryAlertNotification()]),
    } as unknown as jest.Mocked<NotificationsRepository>;
    const auditService = {
      listInventoryAlertAcknowledgementLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.acknowledged',
          resourceId: 'notification_1',
          metadata: {
            note: 'Initial triage done.',
          },
          actorUser: {
            userId: 'usr_admin_1',
            role: UserRole.ADMIN,
            phone: '099999999',
          },
          createdAt: '2026-05-01T10:10:00.000Z',
        },
      ]),
      listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([
        {
          action: 'inventory_alerts.acknowledged',
          resourceId: 'notification_1',
          metadata: {
            note: 'Initial triage done.',
          },
          actorUser: {
            userId: 'usr_admin_1',
            role: UserRole.ADMIN,
            phone: '099999999',
          },
          createdAt: '2026-05-01T10:10:00.000Z',
        },
      ]),
      logAction: jest.fn().mockResolvedValue({
        action: 'inventory_alerts.resolved',
        resourceId: 'notification_1',
        metadata: {
          note: 'Restock confirmed.',
        },
        actorUser: {
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
          phone: '099999999',
        },
        createdAt: '2026-05-01T10:30:00.000Z',
      }),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminInventoryAlertsService(
      notificationsRepository,
      auditService,
    );

    const result = await service.resolveInventoryAlert(currentUser, 'notification_1', {
      note: 'Restock confirmed.',
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'inventory_alerts.resolved',
        resourceId: 'notification_1',
      }),
    );
    expect(result).toMatchObject({
      notificationId: 'notification_1',
      status: AdminInventoryAlertStatus.RESOLVED,
      statusNote: 'Restock confirmed.',
      acknowledgementNote: 'Initial triage done.',
    });
  });

  it('bulk dismisses alerts and supports lifecycle-aware query filtering', async () => {
    const notificationsRepository = {
      findInventoryAlertsByIds: jest
        .fn()
        .mockResolvedValue([makeInventoryAlertNotification()]),
      listRecentInventoryAlerts: jest.fn().mockResolvedValue([
        makeInventoryAlertNotification({
          id: 'notification_2',
          userId: 'usr_merchant_2',
          title: 'Low stock: Jasmine Rice',
          metadataJson: {
            branchId: 'branch_2',
            branchName: 'North Branch',
            resourceType: 'MENU_ITEM',
            resourceId: 'item_2',
            resourceLabel: 'Jasmine Rice',
            attentionLevel: 'LOW_STOCK',
            stockQuantity: 1,
            lowStockThreshold: 2,
            menuItemName: null,
          },
          user: {
            id: 'usr_merchant_2',
            role: UserRole.MERCHANT,
            phone: '0987654321',
          },
        }),
      ]),
    } as unknown as jest.Mocked<NotificationsRepository>;
    const auditService = {
      listInventoryAlertAcknowledgementLogs: jest.fn().mockResolvedValue([]),
      listInventoryAlertLifecycleLogs: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            action: 'inventory_alerts.dismissed',
            resourceId: 'notification_2',
            metadata: {
              note: 'Duplicate noise.',
            },
            actorUser: {
              userId: 'usr_admin_1',
              role: UserRole.ADMIN,
              phone: '099999999',
            },
            createdAt: '2026-05-01T11:00:00.000Z',
          },
        ]),
      logAction: jest.fn().mockResolvedValue({
        action: 'inventory_alerts.dismissed',
        resourceId: 'notification_1',
        metadata: {
          note: 'Duplicate noise.',
        },
        actorUser: {
          userId: 'usr_admin_1',
          role: UserRole.ADMIN,
          phone: '099999999',
        },
        createdAt: '2026-05-01T11:00:00.000Z',
      }),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AdminInventoryAlertsService(
      notificationsRepository,
      auditService,
    );

    const dismissed = await service.bulkDismissInventoryAlerts(currentUser, {
      notificationIds: ['notification_1'],
      note: 'Duplicate noise.',
    });

    expect(dismissed).toMatchObject({
      dismissedCount: 1,
      alerts: [
        expect.objectContaining({
          notificationId: 'notification_1',
          status: AdminInventoryAlertStatus.DISMISSED,
          statusNote: 'Duplicate noise.',
        }),
      ],
    });

    const filtered = await service.listInventoryAlerts(currentUser, {
      status: AdminInventoryAlertStatus.DISMISSED,
      branchId: 'branch_2',
      merchantUserId: 'usr_merchant_2',
      alertKind: AdminInventoryAlertKind.ATTENTION,
      resourceType: 'MENU_ITEM',
      attentionLevel: 'LOW_STOCK',
      keyword: 'jasmine',
      limit: 20,
    });

    expect(filtered).toEqual([
      expect.objectContaining({
        notificationId: 'notification_2',
        merchantUserId: 'usr_merchant_2',
        branchId: 'branch_2',
      }),
    ]);
  });
});
