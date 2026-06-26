import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
import { NotificationAlertDigestService } from '../modules/notifications/services/notification-alert-digest.service';
export type InventoryAlertDigestJobPayload = {
    triggeredAtIso?: string | null;
};
export declare class InventoryAlertDigestJob implements OnModuleInit {
    private readonly queueService;
    private readonly notificationAlertDigestService;
    private readonly logger;
    constructor(queueService: QueueService, notificationAlertDigestService: NotificationAlertDigestService, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: InventoryAlertDigestJobPayload): Promise<void>;
    private resolveTriggeredAt;
}
