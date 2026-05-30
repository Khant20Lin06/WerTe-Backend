import { MerchantInventoryAlertPreferenceRecord } from '../../../../src/modules/notifications/entities/merchant-inventory-alert-preference.entity';
import { NotificationsRepository } from '../../../../src/modules/notifications/repositories/notifications.repository';
import { NotificationDeliveryService } from '../../../../src/modules/notifications/services/notification-delivery.service';
import { NotificationPreferenceScheduleService } from '../../../../src/modules/notifications/services/notification-preference-schedule.service';
import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';

function makePreference(
  overrides: Partial<MerchantInventoryAlertPreferenceRecord> = {},
): MerchantInventoryAlertPreferenceRecord {
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
  let notificationsRepository: jest.Mocked<NotificationsRepository>;
  let notificationDeliveryService: jest.Mocked<NotificationDeliveryService>;
  let logger: jest.Mocked<AppLogger>;
  let service: NotificationPreferenceScheduleService;

  beforeEach(() => {
    jest.useFakeTimers();
    notificationsRepository = {
      listNotificationPreferencesWithQuietHoursEnabled: jest.fn(),
      findNotificationPreferenceByUserId: jest.fn(),
    } as unknown as jest.Mocked<NotificationsRepository>;
    notificationDeliveryService = {
      emitNotificationPreferenceUpdated: jest.fn(),
    } as unknown as jest.Mocked<NotificationDeliveryService>;
    logger = {
      debugEvent: jest.fn(),
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    service = new NotificationPreferenceScheduleService(
      notificationsRepository,
      notificationDeliveryService,
      logger,
    );
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
    ] as never);
    notificationsRepository.findNotificationPreferenceByUserId.mockResolvedValue(
      preference as never,
    );

    await service.onModuleInit();

    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(30_000);

    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).toHaveBeenNthCalledWith(
      1,
      'usr_merchant_1',
      expect.objectContaining({
        inventoryAlertPushCurrentlyMuted: true,
        activeDeliveryChannels: ['IN_APP'],
        inventoryAlertPushSuppressedReason: 'QUIET_HOURS_MUTED',
      }),
    );

    await jest.advanceTimersByTimeAsync(8 * 60 * 60 * 1000);

    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).toHaveBeenNthCalledWith(
      2,
      'usr_merchant_1',
      expect.objectContaining({
        inventoryAlertPushCurrentlyMuted: false,
        activeDeliveryChannels: ['IN_APP', 'PUSH'],
        inventoryAlertPushSuppressedReason: null,
      }),
    );
  });

  it('clears the previous timer when a user preference is rescheduled', async () => {
    jest.setSystemTime(new Date('2026-05-01T14:59:30.000Z'));
    notificationsRepository.findNotificationPreferenceByUserId
      .mockResolvedValueOnce(makePreference() as never)
      .mockResolvedValueOnce(
        makePreference({
          inventoryAlertPushEnabled: false,
        }) as never,
      );

    await service.rescheduleUser('usr_merchant_1');
    await service.rescheduleUser('usr_merchant_1');
    await jest.advanceTimersByTimeAsync(30_000);

    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).not.toHaveBeenCalled();
  });

  it('does not schedule boundary refreshes when quiet-hours fanout would never change state', async () => {
    jest.setSystemTime(new Date('2026-05-01T14:59:30.000Z'));
    notificationsRepository.listNotificationPreferencesWithQuietHoursEnabled.mockResolvedValue([
      makePreference({
        inventoryAlertPushEnabled: false,
      }),
    ] as never);

    await service.onModuleInit();
    await jest.advanceTimersByTimeAsync(12 * 60 * 60 * 1000);

    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).not.toHaveBeenCalled();
  });
});
