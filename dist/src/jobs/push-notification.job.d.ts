import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { FcmService } from '../infrastructure/notifications/fcm.service';
import { QueueService } from '../infrastructure/queue/queue.service';
import { NotificationsService } from '../modules/notifications/services/notifications.service';
type PushNotificationJobPayload = {
    notificationId: string;
    attempt?: number;
};
export declare class PushNotificationJob implements OnModuleInit {
    private readonly queueService;
    private readonly notificationsService;
    private readonly fcmService;
    private readonly logger;
    private static readonly retryDelaysMs;
    private static readonly maxAttempts;
    constructor(queueService: QueueService, notificationsService: NotificationsService, fcmService: FcmService, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: PushNotificationJobPayload): Promise<void>;
    private resolveAttempt;
    private shouldRetry;
    private resolveRetryDelayMs;
}
export {};
