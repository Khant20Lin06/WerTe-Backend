import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../src/infrastructure/queue/queue.service';
import { InventoryAlertDigestJob } from '../../../src/jobs/inventory-alert-digest.job';
import { NotificationAlertDigestService } from '../../../src/modules/notifications/services/notification-alert-digest.service';

describe('InventoryAlertDigestJob', () => {
  it('registers the digest handler and delegates the digest cycle to the service', async () => {
    const queueService = {
      registerHandler: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const notificationAlertDigestService = {
      runDigestCycle: jest.fn().mockResolvedValue({
        attentionAlertsScanned: 3,
        merchantReminderDigestCount: 1,
        reminderSourceAlertCount: 2,
        adminEscalationDigestCount: 2,
        escalationSourceAlertCount: 1,
      }),
    } as unknown as jest.Mocked<NotificationAlertDigestService>;
    const logger = {
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const job = new InventoryAlertDigestJob(
      queueService,
      notificationAlertDigestService,
      logger,
    );

    job.onModuleInit();
    await job.handle({
      triggeredAtIso: '2026-05-02T12:00:00.000Z',
    });

    expect(queueService.registerHandler).toHaveBeenCalledWith(
      'notifications',
      'inventory-alert-digest',
      expect.any(Function),
    );
    expect(notificationAlertDigestService.runDigestCycle).toHaveBeenCalledWith(
      new Date('2026-05-02T12:00:00.000Z'),
    );
    expect(logger.logEvent).toHaveBeenCalledWith(
      'Inventory alert digest job completed.',
      expect.objectContaining({
        attentionAlertsScanned: 3,
        merchantReminderDigestCount: 1,
        adminEscalationDigestCount: 2,
        triggeredAtIso: '2026-05-02T12:00:00.000Z',
      }),
      'InventoryAlertDigestJob',
    );
  });
});
