"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const push_notification_job_1 = require("../../../src/jobs/push-notification.job");
describe('PushNotificationJob', () => {
    it('registers a queue handler and marks queued push deliveries as sent', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const notificationsService = {
            getPushNotificationDispatch: jest.fn().mockResolvedValue({
                id: 'notification_1',
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: '/merchant/branches/branch_1/inventory/overview',
                user: {
                    id: 'usr_merchant_1',
                    pushTokens: [
                        {
                            id: 'push_1',
                            deviceId: 'android-device-001',
                            platform: 'ANDROID',
                            token: 'fcm-token-1',
                            lastSeenAt: new Date('2026-05-01T10:00:00.000Z'),
                        },
                    ],
                },
            }),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesSent: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesFailed: jest.fn().mockResolvedValue(undefined),
            deletePushTokensByIds: jest.fn().mockResolvedValue({ count: 0 }),
        };
        const fcmService = {
            send: jest.fn().mockResolvedValue({
                providerMessageId: 'provider_msg_1',
                deliveredDeviceTokens: ['fcm-token-1'],
                invalidDeviceTokens: [],
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new push_notification_job_1.PushNotificationJob(queueService, notificationsService, fcmService, logger);
        job.onModuleInit();
        await job.handle({
            notificationId: 'notification_1',
        });
        expect(queueService.registerHandler).toHaveBeenCalledWith('notifications', 'push-notification', expect.any(Function));
        expect(fcmService.send).toHaveBeenCalledWith({
            notificationId: 'notification_1',
            userId: 'usr_merchant_1',
            title: 'Low stock: Mohinga',
            body: 'Mohinga is low.',
            navigationPath: '/merchant/branches/branch_1/inventory/overview',
            deviceTokens: ['fcm-token-1'],
        });
        expect(notificationsService.markQueuedPushDeliveriesSent).toHaveBeenCalledWith('notification_1', 'provider_msg_1');
        expect(logger.logEvent).toHaveBeenCalled();
    });
    it('marks queued push deliveries as failed when no active push tokens exist', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const notificationsService = {
            getPushNotificationDispatch: jest.fn().mockResolvedValue({
                id: 'notification_1',
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: '/merchant/branches/branch_1/inventory/overview',
                user: {
                    id: 'usr_merchant_1',
                    pushTokens: [],
                },
            }),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesSent: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesFailed: jest.fn().mockResolvedValue(undefined),
            deletePushTokensByIds: jest.fn().mockResolvedValue({ count: 0 }),
        };
        const fcmService = {
            send: jest.fn(),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new push_notification_job_1.PushNotificationJob(queueService, notificationsService, fcmService, logger);
        await job.handle({
            notificationId: 'notification_1',
        });
        expect(fcmService.send).not.toHaveBeenCalled();
        expect(notificationsService.markQueuedPushDeliveriesFailed).toHaveBeenCalledWith('notification_1', 'NO_ACTIVE_PUSH_TOKEN', 'No active push tokens are registered for this user.');
    });
    it('removes invalid push tokens but still marks delivery sent when at least one device token succeeds', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const notificationsService = {
            getPushNotificationDispatch: jest.fn().mockResolvedValue({
                id: 'notification_1',
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: '/merchant/branches/branch_1/inventory/overview',
                user: {
                    id: 'usr_merchant_1',
                    pushTokens: [
                        {
                            id: 'push_1',
                            deviceId: 'android-device-001',
                            platform: 'ANDROID',
                            token: 'fcm-token-1',
                            lastSeenAt: new Date('2026-05-01T10:00:00.000Z'),
                        },
                        {
                            id: 'push_2',
                            deviceId: 'ios-device-002',
                            platform: 'IOS',
                            token: 'invalid-fcm-token-2',
                            lastSeenAt: new Date('2026-05-01T10:05:00.000Z'),
                        },
                    ],
                },
            }),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesSent: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesFailed: jest.fn().mockResolvedValue(undefined),
            deletePushTokensByIds: jest.fn().mockResolvedValue({ count: 1 }),
        };
        const fcmService = {
            send: jest.fn().mockResolvedValue({
                providerMessageId: 'provider_msg_1',
                deliveredDeviceTokens: ['fcm-token-1'],
                invalidDeviceTokens: ['invalid-fcm-token-2'],
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new push_notification_job_1.PushNotificationJob(queueService, notificationsService, fcmService, logger);
        await job.handle({
            notificationId: 'notification_1',
        });
        expect(notificationsService.deletePushTokensByIds).toHaveBeenCalledWith('usr_merchant_1', ['push_2']);
        expect(notificationsService.markQueuedPushDeliveriesSent).toHaveBeenCalledWith('notification_1', 'provider_msg_1');
        expect(notificationsService.markQueuedPushDeliveriesFailed).not.toHaveBeenCalled();
    });
    it('removes invalid push tokens and marks delivery failed when the provider rejects every token', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const notificationsService = {
            getPushNotificationDispatch: jest.fn().mockResolvedValue({
                id: 'notification_1',
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: '/merchant/branches/branch_1/inventory/overview',
                user: {
                    id: 'usr_merchant_1',
                    pushTokens: [
                        {
                            id: 'push_1',
                            deviceId: 'android-device-001',
                            platform: 'ANDROID',
                            token: 'invalid-fcm-token-1',
                            lastSeenAt: new Date('2026-05-01T10:00:00.000Z'),
                        },
                    ],
                },
            }),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesSent: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesFailed: jest.fn().mockResolvedValue(undefined),
            deletePushTokensByIds: jest.fn().mockResolvedValue({ count: 1 }),
        };
        const fcmService = {
            send: jest.fn().mockResolvedValue({
                providerMessageId: null,
                deliveredDeviceTokens: [],
                invalidDeviceTokens: ['invalid-fcm-token-1'],
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new push_notification_job_1.PushNotificationJob(queueService, notificationsService, fcmService, logger);
        await job.handle({
            notificationId: 'notification_1',
        });
        expect(notificationsService.deletePushTokensByIds).toHaveBeenCalledWith('usr_merchant_1', ['push_1']);
        expect(notificationsService.markQueuedPushDeliveriesFailed).toHaveBeenCalledWith('notification_1', 'INVALID_PUSH_TOKENS', 'All registered push tokens were rejected by the provider.');
        expect(notificationsService.markQueuedPushDeliveriesSent).not.toHaveBeenCalled();
    });
    it('schedules a retry with backoff when the provider fails transiently before max attempts', async () => {
        const queueService = {
            add: jest.fn().mockResolvedValue(undefined),
            registerHandler: jest.fn(),
        };
        const notificationsService = {
            getPushNotificationDispatch: jest.fn().mockResolvedValue({
                id: 'notification_1',
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: '/merchant/branches/branch_1/inventory/overview',
                user: {
                    id: 'usr_merchant_1',
                    pushTokens: [
                        {
                            id: 'push_1',
                            deviceId: 'android-device-001',
                            platform: 'ANDROID',
                            token: 'fcm-token-1',
                            lastSeenAt: new Date('2026-05-01T10:00:00.000Z'),
                        },
                    ],
                },
            }),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesSent: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesFailed: jest.fn().mockResolvedValue(undefined),
            deletePushTokensByIds: jest.fn().mockResolvedValue({ count: 0 }),
        };
        const fcmService = {
            send: jest.fn().mockRejectedValue(new Error('FCM temporary outage')),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new push_notification_job_1.PushNotificationJob(queueService, notificationsService, fcmService, logger);
        await job.handle({
            notificationId: 'notification_1',
            attempt: 1,
        });
        expect(notificationsService.markQueuedPushDeliveriesFailed).toHaveBeenCalledWith('notification_1', 'PUSH_PROVIDER_TRANSIENT_ERROR', 'Attempt 1 of 3 failed. Retry 2 scheduled in 5000ms. FCM temporary outage');
        expect(notificationsService.createDeliveryAttempt).toHaveBeenCalledWith({
            notificationId: 'notification_1',
            channel: client_1.NotificationChannel.PUSH,
            status: client_1.NotificationDeliveryStatus.QUEUED,
            queuedAt: expect.any(Date),
        });
        expect(queueService.add).toHaveBeenCalledWith('notifications', 'push-notification', {
            notificationId: 'notification_1',
            attempt: 2,
        }, {
            delayMs: 5000,
        });
        expect(notificationsService.markQueuedPushDeliveriesSent).not.toHaveBeenCalled();
    });
    it('marks delivery failed without retry when the provider fails on the final attempt', async () => {
        const queueService = {
            add: jest.fn().mockResolvedValue(undefined),
            registerHandler: jest.fn(),
        };
        const notificationsService = {
            getPushNotificationDispatch: jest.fn().mockResolvedValue({
                id: 'notification_1',
                title: 'Low stock: Mohinga',
                body: 'Mohinga is low.',
                navigationPath: '/merchant/branches/branch_1/inventory/overview',
                user: {
                    id: 'usr_merchant_1',
                    pushTokens: [
                        {
                            id: 'push_1',
                            deviceId: 'android-device-001',
                            platform: 'ANDROID',
                            token: 'fcm-token-1',
                            lastSeenAt: new Date('2026-05-01T10:00:00.000Z'),
                        },
                    ],
                },
            }),
            createDeliveryAttempt: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesSent: jest.fn().mockResolvedValue(undefined),
            markQueuedPushDeliveriesFailed: jest.fn().mockResolvedValue(undefined),
            deletePushTokensByIds: jest.fn().mockResolvedValue({ count: 0 }),
        };
        const fcmService = {
            send: jest.fn().mockRejectedValue(new Error('FCM temporary outage')),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new push_notification_job_1.PushNotificationJob(queueService, notificationsService, fcmService, logger);
        await job.handle({
            notificationId: 'notification_1',
            attempt: 3,
        });
        expect(notificationsService.markQueuedPushDeliveriesFailed).toHaveBeenCalledWith('notification_1', 'PUSH_PROVIDER_ERROR', 'Attempt 3 of 3 failed. FCM temporary outage');
        expect(notificationsService.createDeliveryAttempt).not.toHaveBeenCalled();
        expect(queueService.add).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=push-notification.job.spec.js.map