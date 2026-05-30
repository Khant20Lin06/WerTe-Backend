import { NotificationsController } from '../../../../src/modules/notifications/controllers/notifications.controller';
import { NotificationsRestService } from '../../../../src/modules/notifications/services/notifications-rest.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('NotificationsController', () => {
  const currentUser = makeAuthenticatedUser();

  it('delegates notification listing to the REST service', async () => {
    const notificationsRestService = {
      listCurrentUserNotifications: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await controller.list(currentUser, { limit: 20 });

    expect(
      notificationsRestService.listCurrentUserNotifications,
    ).toHaveBeenCalledWith(currentUser, { limit: 20 });
  });

  it('delegates paged notification listing to the REST service', async () => {
    const notificationsRestService = {
      listCurrentUserNotificationPage: jest.fn().mockResolvedValue({
        nextCursor: 'notification_2',
        hasMore: true,
        notifications: [],
      }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(
      controller.listPage(currentUser, {
        limit: 10,
        cursor: 'notification_1',
        preset: 'INVENTORY_OPEN',
      }),
    ).resolves.toMatchObject({
      nextCursor: 'notification_2',
      hasMore: true,
    });

    expect(
      notificationsRestService.listCurrentUserNotificationPage,
    ).toHaveBeenCalledWith(currentUser, {
      limit: 10,
      cursor: 'notification_1',
      preset: 'INVENTORY_OPEN',
    });
  });

  it('delegates unread count lookup to the REST service', async () => {
    const notificationsRestService = {
      getCurrentUserUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 2 }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(controller.unreadCount(currentUser)).resolves.toEqual({
      unreadCount: 2,
    });
  });

  it('delegates unread facets lookup to the REST service', async () => {
    const notificationsRestService = {
      getCurrentUserUnreadFacets: jest
        .fn()
        .mockResolvedValue({ totalUnreadCount: 5, inventoryAlertUnreadCount: 2 }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(controller.unreadFacets(currentUser)).resolves.toEqual({
      totalUnreadCount: 5,
      inventoryAlertUnreadCount: 2,
    });
  });

  it('delegates notification preset lookup to the REST service', async () => {
    const notificationsRestService = {
      listCurrentUserNotificationPresets: jest
        .fn()
        .mockResolvedValue([{ key: 'ALL', unreadCount: 5 }]),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(controller.presets(currentUser)).resolves.toMatchObject([
      { key: 'ALL', unreadCount: 5 },
    ]);
  });

  it('delegates notification contract lookup to the REST service', async () => {
    const notificationsRestService = {
      getCurrentUserNotificationContract: jest.fn().mockReturnValue({
        version: 'notification-contract.v1',
        websocketEvents: {
          notificationCreated: 'notification.created',
        },
      }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    expect(controller.contract()).toMatchObject({
      version: 'notification-contract.v1',
      websocketEvents: {
        notificationCreated: 'notification.created',
      },
    });
  });

  it('delegates merchant inventory alert preference lookup to the REST service', async () => {
    const notificationsRestService = {
      getCurrentMerchantInventoryAlertPreference: jest
        .fn()
        .mockResolvedValue({ inventoryAlertPushEnabled: true }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(
      controller.inventoryAlertPreferences(currentUser),
    ).resolves.toMatchObject({
      inventoryAlertPushEnabled: true,
    });
  });

  it('delegates merchant inventory alert preference updates to the REST service', async () => {
    const notificationsRestService = {
      updateCurrentMerchantInventoryAlertPreference: jest
        .fn()
        .mockResolvedValue({ inventoryAlertPushEnabled: false }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(
      controller.updateInventoryAlertPreferences(currentUser, {
        inventoryAlertPushEnabled: false,
      }),
    ).resolves.toMatchObject({
      inventoryAlertPushEnabled: false,
    });
  });

  it('delegates mark-read to the REST service', async () => {
    const notificationsRestService = {
      markCurrentUserNotificationRead: jest
        .fn()
        .mockResolvedValue({ notificationId: 'notification_1' }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await controller.markRead(currentUser, 'notification_1');

    expect(
      notificationsRestService.markCurrentUserNotificationRead,
    ).toHaveBeenCalledWith(currentUser, 'notification_1');
  });

  it('delegates bulk inventory mark-read to the REST service', async () => {
    const notificationsRestService = {
      bulkMarkCurrentUserInventoryAlertsRead: jest
        .fn()
        .mockResolvedValue({ markedCount: 1, notifications: [] }),
    } as unknown as jest.Mocked<NotificationsRestService>;
    const controller = new NotificationsController(notificationsRestService);

    await expect(
      controller.bulkMarkInventoryAlertsRead(currentUser, {
        markAllMatching: true,
        inventoryAlertStatus: 'OPEN',
      }),
    ).resolves.toMatchObject({
      markedCount: 1,
    });

    expect(
      notificationsRestService.bulkMarkCurrentUserInventoryAlertsRead,
    ).toHaveBeenCalledWith(currentUser, {
      markAllMatching: true,
      inventoryAlertStatus: 'OPEN',
    });
  });
});
