"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PushNotificationJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationJob = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const app_logger_1 = require("../infrastructure/logging/app.logger");
const fcm_service_1 = require("../infrastructure/notifications/fcm.service");
const queue_constants_1 = require("../infrastructure/queue/queue.constants");
const queue_service_1 = require("../infrastructure/queue/queue.service");
const notifications_service_1 = require("../modules/notifications/services/notifications.service");
let PushNotificationJob = PushNotificationJob_1 = class PushNotificationJob {
    constructor(queueService, notificationsService, fcmService, logger) {
        this.queueService = queueService;
        this.notificationsService = notificationsService;
        this.fcmService = fcmService;
        this.logger = logger;
    }
    onModuleInit() {
        this.queueService.registerHandler(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.pushNotification, (payload) => this.handle(payload));
    }
    async handle(payload) {
        const attempt = this.resolveAttempt(payload.attempt);
        const notification = await this.notificationsService.getPushNotificationDispatch(payload.notificationId);
        if (notification === null) {
            this.logger.logEvent('Push notification job skipped because the notification no longer exists.', {
                attempt,
                notificationId: payload.notificationId,
            }, 'PushNotificationJob');
            return;
        }
        const pushTokensByValue = new Map(notification.user.pushTokens.map((pushToken) => [pushToken.token, pushToken]));
        const deviceTokens = [...pushTokensByValue.keys()];
        if (deviceTokens.length === 0) {
            await this.notificationsService.markQueuedPushDeliveriesFailed(payload.notificationId, 'NO_ACTIVE_PUSH_TOKEN', 'No active push tokens are registered for this user.');
            this.logger.logEvent('Push notification job marked delivery as failed because no active push tokens were registered.', {
                attempt,
                notificationId: payload.notificationId,
                userId: notification.user.id,
            }, 'PushNotificationJob');
            return;
        }
        try {
            const result = await this.fcmService.send({
                notificationId: payload.notificationId,
                userId: notification.user.id,
                title: notification.title,
                body: notification.body,
                navigationPath: notification.navigationPath ?? null,
                deviceTokens,
            });
            if (result.invalidDeviceTokens.length > 0) {
                const invalidPushTokenIds = result.invalidDeviceTokens
                    .map((token) => pushTokensByValue.get(token)?.id ?? null)
                    .filter((pushTokenId) => pushTokenId !== null);
                await this.notificationsService.deletePushTokensByIds(notification.user.id, invalidPushTokenIds);
            }
            if (result.deliveredDeviceTokens.length === 0 || result.providerMessageId === null) {
                await this.notificationsService.markQueuedPushDeliveriesFailed(payload.notificationId, 'INVALID_PUSH_TOKENS', 'All registered push tokens were rejected by the provider.');
                this.logger.logEvent('Push notification job removed invalid push tokens after provider rejection.', {
                    attempt,
                    notificationId: payload.notificationId,
                    userId: notification.user.id,
                    invalidDeviceTokenCount: result.invalidDeviceTokens.length,
                }, 'PushNotificationJob');
                return;
            }
            await this.notificationsService.markQueuedPushDeliveriesSent(payload.notificationId, result.providerMessageId);
            this.logger.logEvent('Push notification baseline job processed.', {
                attempt,
                notificationId: payload.notificationId,
                providerMessageId: result.providerMessageId,
                userId: notification.user.id,
                deviceTokenCount: deviceTokens.length,
                deliveredDeviceTokenCount: result.deliveredDeviceTokens.length,
                invalidDeviceTokenCount: result.invalidDeviceTokens.length,
            }, 'PushNotificationJob');
        }
        catch (error) {
            const failureMessage = error instanceof Error ? error.message : 'Unknown push provider failure.';
            if (this.shouldRetry(attempt)) {
                const retryDelayMs = this.resolveRetryDelayMs(attempt);
                const nextAttempt = attempt + 1;
                await this.notificationsService.markQueuedPushDeliveriesFailed(payload.notificationId, 'PUSH_PROVIDER_TRANSIENT_ERROR', `Attempt ${attempt} of ${PushNotificationJob_1.maxAttempts} failed. Retry ${nextAttempt} scheduled in ${retryDelayMs}ms. ${failureMessage}`);
                await this.notificationsService.createDeliveryAttempt({
                    notificationId: payload.notificationId,
                    channel: client_1.NotificationChannel.PUSH,
                    status: client_1.NotificationDeliveryStatus.QUEUED,
                    queuedAt: new Date(),
                });
                await this.queueService.add(queue_constants_1.QueueNames.notifications, queue_constants_1.QueueJobNames.notifications.pushNotification, {
                    notificationId: payload.notificationId,
                    attempt: nextAttempt,
                }, {
                    delayMs: retryDelayMs,
                });
                this.logger.logEvent('Push notification job scheduled a retry after a transient provider failure.', {
                    attempt,
                    failureMessage,
                    nextAttempt,
                    notificationId: payload.notificationId,
                    retryDelayMs,
                    userId: notification.user.id,
                }, 'PushNotificationJob');
                return;
            }
            await this.notificationsService.markQueuedPushDeliveriesFailed(payload.notificationId, 'PUSH_PROVIDER_ERROR', `Attempt ${attempt} of ${PushNotificationJob_1.maxAttempts} failed. ${failureMessage}`);
            this.logger.logEvent('Push notification job failed to deliver through the provider.', {
                attempt,
                notificationId: payload.notificationId,
                userId: notification.user.id,
                failureMessage,
            }, 'PushNotificationJob');
        }
    }
    resolveAttempt(attempt) {
        if (attempt === undefined || !Number.isFinite(attempt)) {
            return 1;
        }
        return Math.max(1, Math.floor(attempt));
    }
    shouldRetry(attempt) {
        return attempt < PushNotificationJob_1.maxAttempts;
    }
    resolveRetryDelayMs(attempt) {
        return (PushNotificationJob_1.retryDelaysMs[attempt - 1] ??
            PushNotificationJob_1.retryDelaysMs[PushNotificationJob_1.retryDelaysMs.length - 1]);
    }
};
exports.PushNotificationJob = PushNotificationJob;
PushNotificationJob.retryDelaysMs = [5_000, 30_000];
PushNotificationJob.maxAttempts = PushNotificationJob_1.retryDelaysMs.length + 1;
exports.PushNotificationJob = PushNotificationJob = PushNotificationJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        notifications_service_1.NotificationsService,
        fcm_service_1.FcmService,
        app_logger_1.AppLogger])
], PushNotificationJob);
//# sourceMappingURL=push-notification.job.js.map