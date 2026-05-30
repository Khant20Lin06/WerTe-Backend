import { AppException } from '../../../../src/common/exceptions/app.exception';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { NotificationPreferencesService } from '../../../../src/modules/notifications/services/notification-preferences.service';
import { NotificationsRestService } from '../../../../src/modules/notifications/services/notifications-rest.service';
import { NotificationsService } from '../../../../src/modules/notifications/services/notifications.service';

describe('NotificationsRestService', () => {
  const currentUser = makeAuthenticatedUser();

  it('lists current user notifications with the requested limit', async () => {
    const notificationsService = {
      listUserNotifications: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await service.listCurrentUserNotifications(currentUser, {
      limit: 15,
      type: 'SYSTEM_ALERT' as never,
      inventoryAlertStatus: 'RESOLVED',
    });

    expect(notificationsService.listUserNotifications).toHaveBeenCalledWith(
      currentUser.userId,
      {
        limit: 15,
        type: 'SYSTEM_ALERT',
        inventoryAlertStatus: 'RESOLVED',
      },
    );
  });

  it('lists current user notification pages with cursor pagination', async () => {
    const notificationsService = {
      listUserNotificationPage: jest.fn().mockResolvedValue({
        nextCursor: 'notification_2',
        hasMore: true,
        notifications: [],
      }),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.listCurrentUserNotificationPage(currentUser, {
        limit: 10,
        cursor: 'notification_1',
        preset: 'INVENTORY_OPEN',
      }),
    ).resolves.toMatchObject({
      nextCursor: 'notification_2',
      hasMore: true,
    });
    expect(notificationsService.listUserNotificationPage).toHaveBeenCalledWith(
      currentUser.userId,
      {
        limit: 10,
        cursor: 'notification_1',
        preset: 'INVENTORY_OPEN',
      },
    );
  });

  it('returns the unread count snapshot', async () => {
    const notificationsService = {
      getUnreadCount: jest.fn().mockResolvedValue(7),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.getCurrentUserUnreadCount(currentUser),
    ).resolves.toEqual({
      unreadCount: 7,
    });
  });

  it('returns unread notification facets for the current user', async () => {
    const notificationsService = {
      getUnreadFacets: jest.fn().mockResolvedValue({
        totalUnreadCount: 5,
        inventoryAlertUnreadCount: 2,
      }),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.getCurrentUserUnreadFacets(currentUser),
    ).resolves.toMatchObject({
      totalUnreadCount: 5,
      inventoryAlertUnreadCount: 2,
    });
  });

  it('returns notification presets for the current user', async () => {
    const notificationsService = {
      listNotificationPresets: jest.fn().mockResolvedValue([
        { key: 'ALL', unreadCount: 5 },
      ]),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.listCurrentUserNotificationPresets(currentUser),
    ).resolves.toMatchObject([{ key: 'ALL', unreadCount: 5 }]);
  });

  it('returns the frozen notification contract snapshot', async () => {
    const notificationsService = {
      getNotificationContract: jest.fn().mockReturnValue({
        version: 'notification-contract.v1',
        restRoutes: {
          contract: '/notifications/contract',
        },
      }),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    expect(service.getCurrentUserNotificationContract()).toMatchObject({
      version: 'notification-contract.v1',
      restRoutes: {
        contract: '/notifications/contract',
      },
    });
  });

  it('marks an owned notification as read', async () => {
    const notificationsService = {
      markNotificationRead: jest.fn().mockResolvedValue({
        notificationId: 'notification_1',
      }),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.markCurrentUserNotificationRead(currentUser, 'notification_1'),
    ).resolves.toMatchObject({
      notificationId: 'notification_1',
    });
  });

  it('throws when the notification does not exist for the user', async () => {
    const notificationsService = {
      markNotificationRead: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.markCurrentUserNotificationRead(currentUser, 'missing'),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('bulk marks inventory alerts as read for the current user', async () => {
    const notificationsService = {
      bulkMarkInventoryAlertsRead: jest.fn().mockResolvedValue({
        markedCount: 2,
        notifications: [],
      }),
    } as unknown as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {} as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.bulkMarkCurrentUserInventoryAlertsRead(currentUser, {
        markAllMatching: true,
        inventoryAlertStatus: 'OPEN',
      }),
    ).resolves.toMatchObject({
      markedCount: 2,
    });
    expect(notificationsService.bulkMarkInventoryAlertsRead).toHaveBeenCalledWith(
      currentUser.userId,
      {
        markAllMatching: true,
        inventoryAlertStatus: 'OPEN',
      },
    );
  });

  it('returns merchant inventory alert delivery preferences for the current merchant', async () => {
    const notificationsService = {} as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {
      getCurrentMerchantInventoryAlertPreference: jest.fn().mockResolvedValue({
        inventoryAlertPushEnabled: true,
      }),
    } as unknown as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.getCurrentMerchantInventoryAlertPreference(currentUser),
    ).resolves.toMatchObject({
      inventoryAlertPushEnabled: true,
    });
  });

  it('updates merchant inventory alert delivery preferences for the current merchant', async () => {
    const notificationsService = {} as jest.Mocked<NotificationsService>;
    const notificationPreferencesService = {
      updateCurrentMerchantInventoryAlertPreference: jest.fn().mockResolvedValue({
        inventoryAlertPushEnabled: false,
      }),
    } as unknown as jest.Mocked<NotificationPreferencesService>;
    const service = new NotificationsRestService(
      notificationsService,
      notificationPreferencesService,
    );

    await expect(
      service.updateCurrentMerchantInventoryAlertPreference(currentUser, {
        inventoryAlertPushEnabled: false,
      }),
    ).resolves.toMatchObject({
      inventoryAlertPushEnabled: false,
    });
  });
});
