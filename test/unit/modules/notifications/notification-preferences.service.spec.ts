import { UserRole, UserStatus } from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { MerchantAccountService } from '../../../../src/modules/merchants/services/merchant-account.service';
import { NotificationsRepository } from '../../../../src/modules/notifications/repositories/notifications.repository';
import { NotificationDeliveryService } from '../../../../src/modules/notifications/services/notification-delivery.service';
import { NotificationPreferenceScheduleService } from '../../../../src/modules/notifications/services/notification-preference-schedule.service';
import { NotificationPreferencesService } from '../../../../src/modules/notifications/services/notification-preferences.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';

function makeMerchantUser(): AuthenticatedUserEntity {
  return {
    userId: 'usr_merchant_1',
    sessionId: 'session_1',
    role: UserRole.MERCHANT,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '091111111',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  };
}

describe('NotificationPreferencesService', () => {
  let notificationsRepository: jest.Mocked<NotificationsRepository>;
  let merchantAccountService: jest.Mocked<MerchantAccountService>;
  let auditService: jest.Mocked<AuditService>;
  let notificationDeliveryService: jest.Mocked<NotificationDeliveryService>;
  let notificationPreferenceScheduleService: jest.Mocked<NotificationPreferenceScheduleService>;
  let service: NotificationPreferencesService;

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    notificationsRepository = {
      findNotificationPreferenceByUserId: jest.fn().mockResolvedValue(null),
      upsertNotificationPreferenceByUserId: jest.fn(),
    } as unknown as jest.Mocked<NotificationsRepository>;
    merchantAccountService = {
      resolveOwnedMerchant: jest.fn().mockResolvedValue({ id: 'merchant_1' }),
    } as unknown as jest.Mocked<MerchantAccountService>;
    auditService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    notificationDeliveryService = {
      emitNotificationPreferenceUpdated: jest.fn(),
    } as unknown as jest.Mocked<NotificationDeliveryService>;
    notificationPreferenceScheduleService = {
      rescheduleUser: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationPreferenceScheduleService>;
    service = new NotificationPreferencesService(
      notificationsRepository,
      merchantAccountService,
      auditService,
      notificationDeliveryService,
      notificationPreferenceScheduleService,
    );
  });

  it('returns default merchant inventory alert preferences when no override exists', async () => {
    await expect(
      service.getCurrentMerchantInventoryAlertPreference(makeMerchantUser()),
    ).resolves.toMatchObject({
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
    } as never);

    await expect(
      service.updateCurrentMerchantInventoryAlertPreference(makeMerchantUser(), {
        inventoryAlertQuietHoursEnabled: true,
        inventoryAlertQuietHoursStartLocalTime: '22:00',
        inventoryAlertQuietHoursEndLocalTime: '06:00',
        inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
      }),
    ).resolves.toMatchObject({
      inventoryAlertQuietHoursEnabled: true,
      inventoryAlertQuietHoursStartLocalTime: '22:00',
      inventoryAlertQuietHoursEndLocalTime: '06:00',
      inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
    });

    expect(
      notificationsRepository.upsertNotificationPreferenceByUserId,
    ).toHaveBeenCalledWith('usr_merchant_1', {
      inventoryAlertPushEnabled: true,
      inventoryAlertQuietHoursEnabled: true,
      inventoryAlertQuietHoursStartLocalTime: '22:00',
      inventoryAlertQuietHoursEndLocalTime: '06:00',
      inventoryAlertQuietHoursTimezone: 'Asia/Bangkok',
    });
    expect(auditService.logAction).toHaveBeenCalled();
    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).toHaveBeenCalledWith(
      'usr_merchant_1',
      expect.objectContaining({
        inventoryAlertQuietHoursEnabled: true,
        inventoryAlertPushSuppressedReason: null,
        activeDeliveryChannels: ['IN_APP', 'PUSH'],
      }),
    );
    expect(notificationPreferenceScheduleService.rescheduleUser).toHaveBeenCalledWith(
      'usr_merchant_1',
    );
  });

  it('rejects enabling quiet hours without a complete window payload', async () => {
    await expect(
      service.updateCurrentMerchantInventoryAlertPreference(makeMerchantUser(), {
        inventoryAlertQuietHoursEnabled: true,
      }),
    ).rejects.toBeInstanceOf(AppException);
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
    } as never);

    await expect(
      service.updateCurrentMerchantInventoryAlertPreference(makeMerchantUser(), {
        inventoryAlertPushEnabled: false,
      }),
    ).resolves.toMatchObject({
      inventoryAlertPushEnabled: false,
      activeDeliveryChannels: ['IN_APP'],
      inventoryAlertPushSuppressedReason: 'PUSH_DISABLED',
    });

    expect(
      notificationDeliveryService.emitNotificationPreferenceUpdated,
    ).toHaveBeenCalledWith(
      'usr_merchant_1',
      expect.objectContaining({
        activeDeliveryChannels: ['IN_APP'],
        inventoryAlertPushSuppressedReason: 'PUSH_DISABLED',
      }),
    );
    expect(notificationPreferenceScheduleService.rescheduleUser).toHaveBeenCalledWith(
      'usr_merchant_1',
    );
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
    } as never);

    await expect(
      service.shouldQueueMerchantInventoryAlertPush(
        'usr_merchant_1',
        new Date('2026-05-01T16:30:00.000Z'),
      ),
    ).resolves.toBe(false);
  });
});
