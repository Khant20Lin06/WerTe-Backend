"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_alert_digest_job_1 = require("../../../src/jobs/inventory-alert-digest.job");
describe('InventoryAlertDigestJob', () => {
    it('registers the digest handler and delegates the digest cycle to the service', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const notificationAlertDigestService = {
            runDigestCycle: jest.fn().mockResolvedValue({
                attentionAlertsScanned: 3,
                merchantReminderDigestCount: 1,
                reminderSourceAlertCount: 2,
                adminEscalationDigestCount: 2,
                escalationSourceAlertCount: 1,
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new inventory_alert_digest_job_1.InventoryAlertDigestJob(queueService, notificationAlertDigestService, logger);
        job.onModuleInit();
        await job.handle({
            triggeredAtIso: '2026-05-02T12:00:00.000Z',
        });
        expect(queueService.registerHandler).toHaveBeenCalledWith('notifications', 'inventory-alert-digest', expect.any(Function));
        expect(notificationAlertDigestService.runDigestCycle).toHaveBeenCalledWith(new Date('2026-05-02T12:00:00.000Z'));
        expect(logger.logEvent).toHaveBeenCalledWith('Inventory alert digest job completed.', expect.objectContaining({
            attentionAlertsScanned: 3,
            merchantReminderDigestCount: 1,
            adminEscalationDigestCount: 2,
            triggeredAtIso: '2026-05-02T12:00:00.000Z',
        }), 'InventoryAlertDigestJob');
    });
});
//# sourceMappingURL=inventory-alert-digest.job.spec.js.map