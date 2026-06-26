import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { QueueService } from '../../../infrastructure/queue/queue.service';
export declare class NotificationAlertDigestScheduleService implements OnModuleInit, OnModuleDestroy {
    private readonly queueService;
    private readonly logger;
    private static readonly intervalMs;
    private interval;
    constructor(queueService: QueueService, logger: AppLogger);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    private enqueueDigestRun;
}
