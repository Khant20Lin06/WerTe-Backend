import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
import { RefundProviderEventProcessorService } from '../modules/refunds/services/refund-provider-event-processor.service';
export type RefundProviderEventProcessingJobPayload = {
    refundProviderEventId: string;
    retryTerminal?: boolean;
};
export declare class RefundProviderEventProcessingJob implements OnModuleInit {
    private readonly queueService;
    private readonly refundProviderEventProcessorService;
    private readonly logger;
    constructor(queueService: QueueService, refundProviderEventProcessorService: RefundProviderEventProcessorService, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: RefundProviderEventProcessingJobPayload): Promise<void>;
}
