"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
const notifications_rest_service_1 = require("../../../../src/modules/notifications/services/notifications-rest.service");
describe('NotificationsRestService', () => {
    const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)();
    it('lists current user notifications with the requested limit', async () => {
        const notificationsService = {
            listUserNotifications: jest.fn().mockResolvedValue([]),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await service.listCurrentUserNotifications(currentUser, {
            limit: 15,
            type: 'SYSTEM_ALERT',
            inventoryAlertStatus: 'RESOLVED',
        });
        expect(notificationsService.listUserNotifications).toHaveBeenCalledWith(currentUser.userId, {
            limit: 15,
            type: 'SYSTEM_ALERT',
            inventoryAlertStatus: 'RESOLVED',
        });
    });
    it('lists current user notification pages with cursor pagination', async () => {
        const notificationsService = {
            listUserNotificationPage: jest.fn().mockResolvedValue({
                nextCursor: 'notification_2',
                hasMore: true,
                notifications: [],
            }),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.listCurrentUserNotificationPage(currentUser, {
            limit: 10,
            cursor: 'notification_1',
            preset: 'INVENTORY_OPEN',
        })).resolves.toMatchObject({
            nextCursor: 'notification_2',
            hasMore: true,
        });
        expect(notificationsService.listUserNotificationPage).toHaveBeenCalledWith(currentUser.userId, {
            limit: 10,
            cursor: 'notification_1',
            preset: 'INVENTORY_OPEN',
        });
    });
    it('returns the unread count snapshot', async () => {
        const notificationsService = {
            getUnreadCount: jest.fn().mockResolvedValue(7),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.getCurrentUserUnreadCount(currentUser)).resolves.toEqual({
            unreadCount: 7,
        });
    });
    it('returns unread notification facets for the current user', async () => {
        const notificationsService = {
            getUnreadFacets: jest.fn().mockResolvedValue({
                totalUnreadCount: 5,
                inventoryAlertUnreadCount: 2,
            }),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.getCurrentUserUnreadFacets(currentUser)).resolves.toMatchObject({
            totalUnreadCount: 5,
            inventoryAlertUnreadCount: 2,
        });
    });
    it('returns notification presets for the current user', async () => {
        const notificationsService = {
            listNotificationPresets: jest.fn().mockResolvedValue([
                { key: 'ALL', unreadCount: 5 },
            ]),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.listCurrentUserNotificationPresets(currentUser)).resolves.toMatchObject([{ key: 'ALL', unreadCount: 5 }]);
    });
    it('returns the frozen notification contract snapshot', async () => {
        const notificationsService = {
            getNotificationContract: jest.fn().mockReturnValue({
                version: 'notification-contract.v1',
                restRoutes: {
                    contract: '/notifications/contract',
                },
            }),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
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
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.markCurrentUserNotificationRead(currentUser, 'notification_1')).resolves.toMatchObject({
            notificationId: 'notification_1',
        });
    });
    it('throws when the notification does not exist for the user', async () => {
        const notificationsService = {
            markNotificationRead: jest.fn().mockResolvedValue(null),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.markCurrentUserNotificationRead(currentUser, 'missing')).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('bulk marks inventory alerts as read for the current user', async () => {
        const notificationsService = {
            bulkMarkInventoryAlertsRead: jest.fn().mockResolvedValue({
                markedCount: 2,
                notifications: [],
            }),
        };
        const notificationPreferencesService = {};
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.bulkMarkCurrentUserInventoryAlertsRead(currentUser, {
            markAllMatching: true,
            inventoryAlertStatus: 'OPEN',
        })).resolves.toMatchObject({
            markedCount: 2,
        });
        expect(notificationsService.bulkMarkInventoryAlertsRead).toHaveBeenCalledWith(currentUser.userId, {
            markAllMatching: true,
            inventoryAlertStatus: 'OPEN',
        });
    });
    it('returns merchant inventory alert delivery preferences for the current merchant', async () => {
        const notificationsService = {};
        const notificationPreferencesService = {
            getCurrentMerchantInventoryAlertPreference: jest.fn().mockResolvedValue({
                inventoryAlertPushEnabled: true,
            }),
        };
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.getCurrentMerchantInventoryAlertPreference(currentUser)).resolves.toMatchObject({
            inventoryAlertPushEnabled: true,
        });
    });
    it('updates merchant inventory alert delivery preferences for the current merchant', async () => {
        const notificationsService = {};
        const notificationPreferencesService = {
            updateCurrentMerchantInventoryAlertPreference: jest.fn().mockResolvedValue({
                inventoryAlertPushEnabled: false,
            }),
        };
        const service = new notifications_rest_service_1.NotificationsRestService(notificationsService, notificationPreferencesService);
        await expect(service.updateCurrentMerchantInventoryAlertPreference(currentUser, {
            inventoryAlertPushEnabled: false,
        })).resolves.toMatchObject({
            inventoryAlertPushEnabled: false,
        });
    });
});
//# sourceMappingURL=notifications-rest.service.spec.js.map