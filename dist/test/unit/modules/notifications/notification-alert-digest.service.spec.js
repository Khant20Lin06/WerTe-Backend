"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const notification_alert_digest_service_1 = require("../../../../src/modules/notifications/services/notification-alert-digest.service");
function makeAttentionAlert(input) {
    return {
        id: input.notificationId,
        userId: input.merchantUserId,
        type: 'SYSTEM_ALERT',
        title: `Low stock: ${input.resourceLabel ?? 'Mohinga'}`,
        body: 'Shortage detected.',
        navigationPath: '/merchant/branches/branch_1/inventory/overview',
        metadataJson: {
            alertKind: 'ATTENTION',
            branchId: input.branchId ?? 'branch_1',
            branchName: input.branchName ?? 'Downtown Branch',
            resourceType: 'MENU_ITEM',
            resourceId: input.resourceId ?? 'item_1',
            resourceLabel: input.resourceLabel ?? 'Mohinga',
            attentionLevel: input.attentionLevel ?? 'LOW_STOCK',
            stockQuantity: input.stockQuantity ?? 2,
            lowStockThreshold: input.lowStockThreshold ?? 3,
            menuItemName: null,
        },
        readAt: null,
        orderId: null,
        deliveryId: null,
        conversationId: null,
        messageId: null,
        createdAt: new Date(input.createdAt),
        updatedAt: new Date(input.createdAt),
        user: {
            id: input.merchantUserId,
            role: client_1.UserRole.MERCHANT,
            phone: input.merchantPhone ?? '0999999999',
        },
    };
}
function makeAuditLog(input) {
    return {
        action: input.action,
        resourceId: input.resourceId,
        createdAt: input.createdAt,
        metadata: null,
        actorUser: null,
    };
}
describe('NotificationAlertDigestService', () => {
    function makeDependencies() {
        const notificationsRepository = {
            listRecentInventoryAlerts: jest.fn(),
        };
        const notificationsService = {
            createNotification: jest.fn(),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
        };
        const notificationPreferencesService = {
            shouldQueueMerchantInventoryAlertPush: jest.fn().mockResolvedValue(true),
        };
        const queueService = {
            add: jest.fn().mockResolvedValue(undefined),
        };
        const auditService = {
            listInventoryAlertLifecycleLogs: jest.fn().mockResolvedValue([]),
            listInventoryAlertFollowUpLogs: jest.fn().mockResolvedValue([]),
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        const usersService = {
            listActiveByRoles: jest.fn().mockResolvedValue([]),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const service = new notification_alert_digest_service_1.NotificationAlertDigestService(notificationsRepository, notificationsService, notificationPreferencesService, queueService, auditService, usersService, logger);
        return {
            notificationsRepository,
            notificationsService,
            notificationPreferencesService,
            queueService,
            auditService,
            usersService,
            logger,
            service,
        };
    }
    it('creates a merchant reminder digest and queues push when unresolved alerts age past the reminder threshold', async () => {
        const { notificationsRepository, notificationsService, queueService, auditService, usersService, service, } = makeDependencies();
        notificationsRepository.listRecentInventoryAlerts.mockResolvedValue([
            makeAttentionAlert({
                notificationId: 'notification_1',
                merchantUserId: 'usr_merchant_1',
                resourceLabel: 'Mohinga',
                createdAt: '2026-05-02T11:10:00.000Z',
            }),
        ]);
        notificationsService.createNotification.mockResolvedValue({
            notificationId: 'notification_digest_1',
        });
        const result = await service.runDigestCycle(new Date('2026-05-02T12:00:00.000Z'));
        expect(notificationsService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'usr_merchant_1',
            type: 'SUPPORT_UPDATE',
            title: 'Inventory reminder: Downtown Branch',
            navigationPath: '/merchant/branches/branch_1/inventory/overview',
            metadataJson: expect.objectContaining({
                digestKind: 'MERCHANT_INVENTORY_REMINDER',
                attentionAlertCount: 1,
            }),
        }));
        expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(1, expect.objectContaining({
            notificationId: 'notification_digest_1',
            channel: client_1.NotificationChannel.IN_APP,
            status: client_1.NotificationDeliveryStatus.DELIVERED,
        }));
        expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(2, expect.objectContaining({
            notificationId: 'notification_digest_1',
            channel: client_1.NotificationChannel.PUSH,
            status: client_1.NotificationDeliveryStatus.QUEUED,
        }));
        expect(queueService.add).toHaveBeenCalledWith('notifications', 'push-notification', {
            notificationId: 'notification_digest_1',
            attempt: 1,
        });
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'inventory_alerts.reminder_sent',
            resourceId: 'notification_1',
        }));
        expect(usersService.listActiveByRoles).not.toHaveBeenCalled();
        expect(result).toEqual({
            attentionAlertsScanned: 1,
            merchantReminderDigestCount: 1,
            reminderSourceAlertCount: 1,
            adminEscalationDigestCount: 0,
            escalationSourceAlertCount: 0,
        });
    });
    it('creates admin escalation notifications for old unresolved alerts when no recent escalation exists', async () => {
        const { notificationsRepository, notificationsService, notificationPreferencesService, auditService, usersService, service, } = makeDependencies();
        notificationsRepository.listRecentInventoryAlerts.mockResolvedValue([
            makeAttentionAlert({
                notificationId: 'notification_1',
                merchantUserId: 'usr_merchant_1',
                createdAt: '2026-05-02T08:30:00.000Z',
            }),
        ]);
        auditService.listInventoryAlertFollowUpLogs.mockResolvedValue([
            makeAuditLog({
                action: 'inventory_alerts.reminder_sent',
                resourceId: 'notification_1',
                createdAt: '2026-05-02T09:30:00.000Z',
            }),
        ]);
        usersService.listActiveByRoles.mockResolvedValue([
            {
                id: 'usr_admin_1',
                phone: '091111111',
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
            {
                id: 'usr_support_1',
                phone: '092222222',
                role: client_1.UserRole.SUPPORT,
                status: client_1.UserStatus.ACTIVE,
            },
        ]);
        notificationsService.createNotification
            .mockResolvedValueOnce({
            notificationId: 'notification_admin_1',
        })
            .mockResolvedValueOnce({
            notificationId: 'notification_support_1',
        });
        const result = await service.runDigestCycle(new Date('2026-05-02T12:00:00.000Z'));
        expect(notificationPreferencesService.shouldQueueMerchantInventoryAlertPush).not.toHaveBeenCalled();
        expect(usersService.listActiveByRoles).toHaveBeenCalledWith([
            client_1.UserRole.ADMIN,
            client_1.UserRole.SUPPORT,
        ]);
        expect(notificationsService.createNotification).toHaveBeenNthCalledWith(1, expect.objectContaining({
            userId: 'usr_admin_1',
            type: 'SUPPORT_UPDATE',
            title: 'Inventory escalation: Downtown Branch',
        }));
        expect(notificationsService.createNotification).toHaveBeenNthCalledWith(2, expect.objectContaining({
            userId: 'usr_support_1',
            type: 'SUPPORT_UPDATE',
            title: 'Inventory escalation: Downtown Branch',
        }));
        expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(1, expect.objectContaining({
            notificationId: 'notification_admin_1',
            channel: client_1.NotificationChannel.IN_APP,
            status: client_1.NotificationDeliveryStatus.DELIVERED,
        }));
        expect(notificationsService.createDeliveryAttempt).toHaveBeenNthCalledWith(2, expect.objectContaining({
            notificationId: 'notification_support_1',
            channel: client_1.NotificationChannel.IN_APP,
            status: client_1.NotificationDeliveryStatus.DELIVERED,
        }));
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'inventory_alerts.escalated',
            resourceId: 'notification_1',
            metadataJson: expect.objectContaining({
                recipientCount: 2,
            }),
        }));
        expect(result).toEqual({
            attentionAlertsScanned: 1,
            merchantReminderDigestCount: 0,
            reminderSourceAlertCount: 0,
            adminEscalationDigestCount: 2,
            escalationSourceAlertCount: 1,
        });
    });
    it('skips resolved alerts and alerts with recent follow-up logs', async () => {
        const { notificationsRepository, notificationsService, queueService, auditService, usersService, service, } = makeDependencies();
        notificationsRepository.listRecentInventoryAlerts.mockResolvedValue([
            makeAttentionAlert({
                notificationId: 'notification_1',
                merchantUserId: 'usr_merchant_1',
                createdAt: '2026-05-02T09:00:00.000Z',
            }),
        ]);
        auditService.listInventoryAlertLifecycleLogs.mockResolvedValue([
            makeAuditLog({
                action: 'inventory_alerts.resolved',
                resourceId: 'notification_1',
                createdAt: '2026-05-02T10:00:00.000Z',
            }),
        ]);
        const result = await service.runDigestCycle(new Date('2026-05-02T12:00:00.000Z'));
        expect(notificationsService.createNotification).not.toHaveBeenCalled();
        expect(notificationsService.createDeliveryAttempt).not.toHaveBeenCalled();
        expect(queueService.add).not.toHaveBeenCalled();
        expect(auditService.logAction).not.toHaveBeenCalled();
        expect(usersService.listActiveByRoles).not.toHaveBeenCalled();
        expect(result).toEqual({
            attentionAlertsScanned: 1,
            merchantReminderDigestCount: 0,
            reminderSourceAlertCount: 0,
            adminEscalationDigestCount: 0,
            escalationSourceAlertCount: 0,
        });
    });
});
//# sourceMappingURL=notification-alert-digest.service.spec.js.map