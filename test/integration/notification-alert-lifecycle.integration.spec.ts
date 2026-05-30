import { NotificationType, UserRole } from '@prisma/client';

import { AuthRepository } from '../../src/modules/auth/repositories/auth.repository';
import { AdminInventoryAlertsService } from '../../src/modules/notifications/services/admin-inventory-alerts.service';
import { NotificationsRestService } from '../../src/modules/notifications/services/notifications-rest.service';
import { UsersService } from '../../src/modules/users/services/users.service';
import { createAuthSessionHarness } from './helpers/create-auth-session-harness';
import { createIntegrationApp } from './helpers/create-integration-app';

describe('Notification alert lifecycle integration', () => {
  it('serves merchant notification and admin inventory alert lifecycle routes through authenticated surfaces', async () => {
    const auth = await createAuthSessionHarness([
      {
        key: 'merchant',
        userId: 'usr_merchant_1',
        role: UserRole.MERCHANT,
        phone: '0991111111',
        sessionId: 'sess_merchant_1',
        merchantId: 'merchant_1',
      },
      {
        key: 'admin',
        userId: 'usr_admin_1',
        role: UserRole.ADMIN,
        phone: '09777777777',
        sessionId: 'sess_admin_1',
      },
      {
        key: 'customer',
        userId: 'usr_customer_1',
        role: UserRole.CUSTOMER,
        phone: '09123456789',
        sessionId: 'sess_customer_1',
        customerProfileId: 'cust_prof_1',
      },
    ] as const);

    const openNotification = {
      notificationId: 'notification_inventory_1',
      userId: 'usr_merchant_1',
      type: NotificationType.SYSTEM_ALERT,
      title: 'Low stock: Mohinga',
      body: 'Mohinga is now low in Downtown Branch with 2 left.',
      navigationPath: '/merchant/branches/branch_1/inventory/overview',
      metadata: {
        alertKind: 'ATTENTION',
      },
      readAt: null,
      orderId: null,
      orderCode: null,
      orderStatus: null,
      deliveryId: null,
      deliveryStatus: null,
      riderId: null,
      conversationId: null,
      conversationType: null,
      messageId: null,
      messageType: null,
      messageCreatedAt: null,
      createdAt: '2026-05-02T08:00:00.000Z',
      updatedAt: '2026-05-02T08:00:00.000Z',
      inventoryAlert: {
        alertKind: 'ATTENTION',
        status: 'OPEN',
        branchId: 'branch_1',
        branchName: 'Downtown Branch',
        resourceType: 'MENU_ITEM',
        resourceId: 'item_1',
        resourceLabel: 'Mohinga',
        menuItemName: 'Mohinga',
        attentionLevel: 'LOW_STOCK',
        stockQuantity: 2,
        lowStockThreshold: 3,
        restoredQuantity: null,
        orderId: null,
        orderCode: null,
        reasonCode: null,
        acknowledgementNote: null,
        acknowledgedAt: null,
        statusNote: null,
        statusChangedAt: null,
      },
      deliveries: [],
    };

    const readNotification = {
      ...openNotification,
      readAt: '2026-05-02T08:05:00.000Z',
    };

    const quietHoursPreference = {
      userId: 'usr_merchant_1',
      inventoryAlertPushEnabled: true,
      inventoryAlertQuietHoursEnabled: true,
      inventoryAlertQuietHoursStartLocalTime: '22:00',
      inventoryAlertQuietHoursEndLocalTime: '06:00',
      inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
      inventoryAlertPushCurrentlyMuted: false,
      deliveryLanes: [
        {
          channel: 'IN_APP',
          enabled: true,
          active: true,
          suppressionReason: null,
        },
        {
          channel: 'PUSH',
          enabled: true,
          active: true,
          suppressionReason: null,
        },
      ],
      activeDeliveryChannels: ['IN_APP', 'PUSH'],
      inventoryAlertPushSuppressedReason: null,
    };

    const openAdminAlert = {
      notificationId: 'notification_inventory_1',
      type: NotificationType.SYSTEM_ALERT,
      title: 'Low stock: Mohinga',
      body: 'Mohinga is now low in Downtown Branch with 2 left.',
      navigationPath: '/merchant/branches/branch_1/inventory/overview',
      merchantUserId: 'usr_merchant_1',
      merchantRole: UserRole.MERCHANT,
      merchantPhone: '0991111111',
      branchId: 'branch_1',
      branchName: 'Downtown Branch',
      alertKind: 'ATTENTION',
      resourceType: 'MENU_ITEM',
      resourceId: 'item_1',
      resourceLabel: 'Mohinga',
      menuItemName: 'Mohinga',
      attentionLevel: 'LOW_STOCK',
      stockQuantity: 2,
      lowStockThreshold: 3,
      restoredQuantity: null,
      orderId: null,
      orderCode: null,
      reasonCode: null,
      merchantReadAt: null,
      status: 'OPEN',
      acknowledgementNote: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      statusNote: null,
      statusChangedAt: null,
      statusChangedBy: null,
      createdAt: '2026-05-02T08:00:00.000Z',
    };

    const acknowledgedAdminAlert = {
      ...openAdminAlert,
      status: 'ACKNOWLEDGED',
      acknowledgementNote: 'Merchant contacted for restock.',
      acknowledgedAt: '2026-05-02T08:10:00.000Z',
      acknowledgedBy: {
        userId: 'usr_admin_1',
        role: UserRole.ADMIN,
        phone: '09777777777',
      },
      statusNote: 'Merchant contacted for restock.',
      statusChangedAt: '2026-05-02T08:10:00.000Z',
      statusChangedBy: {
        userId: 'usr_admin_1',
        role: UserRole.ADMIN,
        phone: '09777777777',
      },
    };

    const resolvedAdminAlert = {
      ...acknowledgedAdminAlert,
      status: 'RESOLVED',
      statusNote: 'Restock confirmed.',
      statusChangedAt: '2026-05-02T08:20:00.000Z',
    };

    const dismissedAdminAlert = {
      ...openAdminAlert,
      notificationId: 'notification_inventory_2',
      resourceId: 'option_1',
      resourceType: 'ITEM_OPTION',
      resourceLabel: 'Extra fish cake',
      menuItemName: 'Mohinga',
      attentionLevel: 'OUT_OF_STOCK',
      stockQuantity: 0,
      lowStockThreshold: 2,
      status: 'DISMISSED',
      statusNote: 'Known supplier delay.',
      statusChangedAt: '2026-05-02T08:30:00.000Z',
      statusChangedBy: {
        userId: 'usr_admin_1',
        role: UserRole.ADMIN,
        phone: '09777777777',
      },
    };

    const notificationsRestService = {
      getCurrentUserNotificationContract: jest.fn().mockReturnValue({
        version: 'notification-contract.v1',
        restRoutes: {
          contract: '/notifications/contract',
          page: '/notifications/page',
        },
        websocketEvents: {
          notificationCreated: 'notification.created',
          preferenceUpdated: 'notification.preference.updated',
        },
      }),
      listCurrentUserNotifications: jest
        .fn()
        .mockResolvedValue([openNotification]),
      getCurrentMerchantInventoryAlertPreference: jest
        .fn()
        .mockResolvedValue(quietHoursPreference),
      updateCurrentMerchantInventoryAlertPreference: jest
        .fn()
        .mockResolvedValue(quietHoursPreference),
      bulkMarkCurrentUserInventoryAlertsRead: jest.fn().mockResolvedValue({
        markedCount: 1,
        notifications: [readNotification],
      }),
    };

    const adminInventoryAlertsService = {
      listInventoryAlerts: jest.fn().mockResolvedValue([openAdminAlert]),
      acknowledgeInventoryAlert: jest
        .fn()
        .mockResolvedValue(acknowledgedAdminAlert),
      resolveInventoryAlert: jest.fn().mockResolvedValue(resolvedAdminAlert),
      bulkDismissInventoryAlerts: jest.fn().mockResolvedValue({
        dismissedCount: 1,
        alerts: [dismissedAdminAlert],
      }),
    };

    const harness = await createIntegrationApp({
      overrides: [
        { provide: AuthRepository, useValue: auth.authRepository },
        { provide: UsersService, useValue: auth.usersService },
        {
          provide: NotificationsRestService,
          useValue: notificationsRestService,
        },
        {
          provide: AdminInventoryAlertsService,
          useValue: adminInventoryAlertsService,
        },
      ],
    });

    try {
      const merchantClient = harness.client.withBearerToken(
        auth.actors.merchant.accessToken,
      );
      const adminClient = harness.client.withBearerToken(
        auth.actors.admin.accessToken,
      );
      const customerClient = harness.client.withBearerToken(
        auth.actors.customer.accessToken,
      );

      const contractResponse = await merchantClient.get(
        '/api/v1/notifications/contract',
      );
      expect(contractResponse.status).toBe(200);
      expect(contractResponse.body).toMatchObject({
        success: true,
        data: {
          version: 'notification-contract.v1',
          websocketEvents: {
            preferenceUpdated: 'notification.preference.updated',
          },
        },
      });

      const notificationsResponse = await merchantClient.get(
        '/api/v1/notifications?type=SYSTEM_ALERT&inventoryAlertStatus=OPEN',
      );
      expect(notificationsResponse.status).toBe(200);
      expect(notificationsResponse.body).toMatchObject({
        success: true,
        data: [
          {
            notificationId: 'notification_inventory_1',
            inventoryAlert: {
              status: 'OPEN',
              attentionLevel: 'LOW_STOCK',
            },
          },
        ],
      });
      expect(notificationsRestService.listCurrentUserNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_merchant_1',
          role: UserRole.MERCHANT,
        }),
        expect.objectContaining({
          type: NotificationType.SYSTEM_ALERT,
          inventoryAlertStatus: 'OPEN',
        }),
      );

      const preferenceResponse = await merchantClient.get(
        '/api/v1/notifications/inventory-alert-preferences',
      );
      expect(preferenceResponse.status).toBe(200);
      expect(preferenceResponse.body).toMatchObject({
        success: true,
        data: {
          inventoryAlertQuietHoursEnabled: true,
          inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        },
      });

      const updatePreferenceResponse = await merchantClient.patch(
        '/api/v1/notifications/inventory-alert-preferences',
        {
          body: {
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
          },
        },
      );
      expect(updatePreferenceResponse.status).toBe(200);
      expect(updatePreferenceResponse.body).toMatchObject({
        success: true,
        data: {
          activeDeliveryChannels: ['IN_APP', 'PUSH'],
        },
      });
      expect(
        notificationsRestService.updateCurrentMerchantInventoryAlertPreference,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_merchant_1',
          role: UserRole.MERCHANT,
        }),
        expect.objectContaining({
          inventoryAlertQuietHoursEnabled: true,
          inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        }),
      );

      const bulkReadResponse = await merchantClient.post(
        '/api/v1/notifications/inventory-alerts/mark-read',
        {
          body: {
            notificationIds: ['notification_inventory_1'],
          },
        },
      );
      expect(bulkReadResponse.status).toBe(201);
      expect(bulkReadResponse.body).toMatchObject({
        success: true,
        data: {
          markedCount: 1,
          notifications: [
            {
              notificationId: 'notification_inventory_1',
              readAt: '2026-05-02T08:05:00.000Z',
            },
          ],
        },
      });

      const customerPreferenceForbidden = await customerClient.get(
        '/api/v1/notifications/inventory-alert-preferences',
      );
      expect(customerPreferenceForbidden.status).toBe(403);

      const adminListResponse = await adminClient.get(
        '/api/v1/admin/inventory-alerts?status=OPEN&branchId=branch_1',
      );
      expect(adminListResponse.status).toBe(200);
      expect(adminListResponse.body).toMatchObject({
        success: true,
        data: [
          {
            notificationId: 'notification_inventory_1',
            status: 'OPEN',
            branchId: 'branch_1',
          },
        ],
      });

      const acknowledgeResponse = await adminClient.post(
        '/api/v1/admin/inventory-alerts/notification_inventory_1/acknowledge',
        {
          body: {
            note: 'Merchant contacted for restock.',
          },
        },
      );
      expect(acknowledgeResponse.status).toBe(201);
      expect(acknowledgeResponse.body).toMatchObject({
        success: true,
        data: {
          notificationId: 'notification_inventory_1',
          status: 'ACKNOWLEDGED',
          acknowledgementNote: 'Merchant contacted for restock.',
        },
      });

      const resolveResponse = await adminClient.post(
        '/api/v1/admin/inventory-alerts/notification_inventory_1/resolve',
        {
          body: {
            note: 'Restock confirmed.',
          },
        },
      );
      expect(resolveResponse.status).toBe(201);
      expect(resolveResponse.body).toMatchObject({
        success: true,
        data: {
          notificationId: 'notification_inventory_1',
          status: 'RESOLVED',
          statusNote: 'Restock confirmed.',
        },
      });

      const bulkDismissResponse = await adminClient.post(
        '/api/v1/admin/inventory-alerts/bulk-dismiss',
        {
          body: {
            notificationIds: ['notification_inventory_2'],
            note: 'Known supplier delay.',
          },
        },
      );
      expect(bulkDismissResponse.status).toBe(201);
      expect(bulkDismissResponse.body).toMatchObject({
        success: true,
        data: {
          dismissedCount: 1,
          alerts: [
            {
              notificationId: 'notification_inventory_2',
              status: 'DISMISSED',
            },
          ],
        },
      });

      const merchantAdminForbidden = await merchantClient.get(
        '/api/v1/admin/inventory-alerts',
      );
      expect(merchantAdminForbidden.status).toBe(403);
      expect(merchantAdminForbidden.body).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
        },
      });
    } finally {
      await harness.close();
    }
  });
});
