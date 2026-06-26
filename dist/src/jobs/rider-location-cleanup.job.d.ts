import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
type RiderLocationCleanupJobPayload = {
    riderId?: string | null;
    beforeIso?: string | null;
};
export declare class RiderLocationCleanupJob implements OnModuleInit {
    private readonly queueService;
    private readonly logger;
    constructor(queueService: QueueService, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: RiderLocationCleanupJobPayload): Promise<void>;
}
export {};
