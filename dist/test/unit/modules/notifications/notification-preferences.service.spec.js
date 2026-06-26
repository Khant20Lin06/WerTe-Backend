"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_exception_1 = require("../../../../src/common/exceptions/app.exception");
const notification_preferences_service_1 = require("../../../../src/modules/notifications/services/notification-preferences.service");
function makeMerchantUser() {
    return {
        userId: 'usr_merchant_1',
        sessionId: 'session_1',
        role: client_1.UserRole.MERCHANT,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '091111111',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    };
}
describe('NotificationPreferencesService', () => {
    let notificationsRepository;
    let merchantAccountService;
    let auditService;
    let notificationDeliveryService;
    let notificationPreferenceScheduleService;
    let service;
    afterEach(() => {
        jest.useRealTimers();
    });
    beforeEach(() => {
        notificationsRepository = {
            findNotificationPreferenceByUserId: jest.fn().mockResolvedValue(null),
            upsertNotificationPreferenceByUserId: jest.fn(),
        };
        merchantAccountService = {
            resolveOwnedMerchant: jest.fn().mockResolvedValue({ id: 'merchant_1' }),
        };
        auditService = {
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        notificationDeliveryService = {
            emitNotificationPreferenceUpdated: jest.fn(),
        };
        notificationPreferenceScheduleService = {
            rescheduleUser: jest.fn().mockResolvedValue(undefined),
        };
        service = new notification_preferences_service_1.NotificationPreferencesService(notificationsRepository, merchantAccountService, auditService, notificationDeliveryService, notificationPreferenceScheduleService);
    });
    it('returns default merchant inventory alert preferences when no override exists', async () => {
        await expect(service.getCurrentMerchantInventoryAlertPreference(makeMerchantUser())).resolves.toMatchObject({
            userId: 'usr_merchant_1',
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: false,
            inventoryAlertQuietHoursStartLocalTime: null,
            inventoryAlertQuietHoursEndLocalTime: null,
            inventoryAlertQuietHoursTimezone: null,
            inventoryAlertPushCurrentlyMuted: false,
        });
    });
    it('updates merchant inventory alert quiet hours and logs the change', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-05-01T04:00:00.000Z'));
        notificationsRepository.upsertNotificationPreferenceByUserId.mockResolvedValue({
            id: 'pref_1',
            userId: 'usr_merchant_1',
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
            createdAt: new Date('2026-05-01T10:00:00.000Z'),
            updatedAt: new Date('2026-05-01T10:05:00.000Z'),
        });
        await expect(service.updateCurrentMerchantInventoryAlertPreference(makeMerchantUser(), {
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        })).resolves.toMatchObject({
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        });
        expect(notificationsRepository.upsertNotificationPreferenceByUserId).toHaveBeenCalledWith('usr_merchant_1', {
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        });
        expect(auditService.logAction).toHaveBeenCalled();
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).toHaveBeenCalledWith('usr_merchant_1', expect.objectContaining({
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertPushSuppressedReason: null,
            activeDeliveryChannels: ['IN_APP', 'PUSH'],
        }));
        expect(notificationPreferenceScheduleService.rescheduleUser).toHaveBeenCalledWith('usr_merchant_1');
    });
    it('rejects enabling quiet hours without a complete window payload', async () => {
        await expect(service.updateCurrentMerchantInventoryAlertPreference(makeMerchantUser(), {
            inventoryAlertQuietHoursEnabled: true,
        })).rejects.toBeInstanceOf(app_exception_1.AppException);
    });
    it('emits in-app-only lane state when merchant disables inventory alert push', async () => {
        notificationsRepository.upsertNotificationPreferenceByUserId.mockResolvedValue({
            id: 'pref_2',
            userId: 'usr_merchant_1',
            inventoryAlertPushEnabled: false,
            inventoryAlertQuietHoursEnabled: false,
            inventoryAlertQuietHoursStartLocalTime: null,
            inventoryAlertQuietHoursEndLocalTime: null,
            inventoryAlertQuietHoursTimezone: null,
            createdAt: new Date('2026-05-01T10:00:00.000Z'),
            updatedAt: new Date('2026-05-01T10:06:00.000Z'),
        });
        await expect(service.updateCurrentMerchantInventoryAlertPreference(makeMerchantUser(), {
            inventoryAlertPushEnabled: false,
        })).resolves.toMatchObject({
            inventoryAlertPushEnabled: false,
            activeDeliveryChannels: ['IN_APP'],
            inventoryAlertPushSuppressedReason: 'PUSH_DISABLED',
        });
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).toHaveBeenCalledWith('usr_merchant_1', expect.objectContaining({
            activeDeliveryChannels: ['IN_APP'],
            inventoryAlertPushSuppressedReason: 'PUSH_DISABLED',
        }));
        expect(notificationPreferenceScheduleService.rescheduleUser).toHaveBeenCalledWith('usr_merchant_1');
    });
    it('mutes merchant inventory alert push delivery during the configured quiet-hours window', async () => {
        notificationsRepository.findNotificationPreferenceByUserId.mockResolvedValue({
            id: 'pref_1',
            userId: 'usr_merchant_1',
            inventoryAlertPushEnabled: true,
            inventoryAlertQuietHoursEnabled: true,
            inventoryAlertQuietHoursStartLocalTime: '22:00',
            inventoryAlertQuietHoursEndLocalTime: '06:00',
            inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
            createdAt: new Date('2026-05-01T10:00:00.000Z'),
            updatedAt: new Date('2026-05-01T10:05:00.000Z'),
        });
        await expect(service.shouldQueueMerchantInventoryAlertPush('usr_merchant_1', new Date('2026-05-01T16:30:00.000Z'))).resolves.toBe(false);
    });
});
//# sourceMappingURL=notification-preferences.service.spec.js.map