"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_preference_schedule_service_1 = require("../../../../src/modules/notifications/services/notification-preference-schedule.service");
function makePreference(overrides = {}) {
    return {
        id: 'pref_1',
        userId: 'usr_merchant_1',
        inventoryAlertPushEnabled: true,
        inventoryAlertQuietHoursEnabled: true,
        inventoryAlertQuietHoursStartLocalTime: '22:00',
        inventoryAlertQuietHoursEndLocalTime: '06:00',
        inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        ...overrides,
    };
}
describe('NotificationPreferenceScheduleService', () => {
    let notificationsRepository;
    let notificationDeliveryService;
    let logger;
    let service;
    beforeEach(() => {
        jest.useFakeTimers();
        notificationsRepository = {
            listNotificationPreferencesWithQuietHoursEnabled: jest.fn(),
            findNotificationPreferenceByUserId: jest.fn(),
        };
        notificationDeliveryService = {
            emitNotificationPreferenceUpdated: jest.fn(),
        };
        logger = {
            debugEvent: jest.fn(),
            logEvent: jest.fn(),
        };
        service = new notification_preference_schedule_service_1.NotificationPreferenceScheduleService(notificationsRepository, notificationDeliveryService, logger);
    });
    afterEach(() => {
        service.onModuleDestroy();
        jest.useRealTimers();
    });
    it('emits refreshed preference snapshots when quiet-hours boundaries are reached', async () => {
        jest.setSystemTime(new Date('2026-05-01T14:59:30.000Z'));
        const preference = makePreference();
        notificationsRepository.listNotificationPreferencesWithQuietHoursEnabled.mockResolvedValue([
            preference,
        ]);
        notificationsRepository.findNotificationPreferenceByUserId.mockResolvedValue(preference);
        await service.onModuleInit();
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).not.toHaveBeenCalled();
        await jest.advanceTimersByTimeAsync(30_000);
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).toHaveBeenNthCalledWith(1, 'usr_merchant_1', expect.objectContaining({
            inventoryAlertPushCurrentlyMuted: true,
            activeDeliveryChannels: ['IN_APP'],
            inventoryAlertPushSuppressedReason: 'QUIET_HOURS_MUTED',
        }));
        await jest.advanceTimersByTimeAsync(8 * 60 * 60 * 1000);
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).toHaveBeenNthCalledWith(2, 'usr_merchant_1', expect.objectContaining({
            inventoryAlertPushCurrentlyMuted: false,
            activeDeliveryChannels: ['IN_APP', 'PUSH'],
            inventoryAlertPushSuppressedReason: null,
        }));
    });
    it('clears the previous timer when a user preference is rescheduled', async () => {
        jest.setSystemTime(new Date('2026-05-01T14:59:30.000Z'));
        notificationsRepository.findNotificationPreferenceByUserId
            .mockResolvedValueOnce(makePreference())
            .mockResolvedValueOnce(makePreference({
            inventoryAlertPushEnabled: false,
        }));
        await service.rescheduleUser('usr_merchant_1');
        await service.rescheduleUser('usr_merchant_1');
        await jest.advanceTimersByTimeAsync(30_000);
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).not.toHaveBeenCalled();
    });
    it('does not schedule boundary refreshes when quiet-hours fanout would never change state', async () => {
        jest.setSystemTime(new Date('2026-05-01T14:59:30.000Z'));
        notificationsRepository.listNotificationPreferencesWithQuietHoursEnabled.mockResolvedValue([
            makePreference({
                inventoryAlertPushEnabled: false,
            }),
        ]);
        await service.onModuleInit();
        await jest.advanceTimersByTimeAsync(12 * 60 * 60 * 1000);
        expect(notificationDeliveryService.emitNotificationPreferenceUpdated).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=notification-preference-schedule.service.spec.js.map