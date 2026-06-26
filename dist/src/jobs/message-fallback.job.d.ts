import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
type MessageFallbackJobPayload = {
    conversationId: string;
};
export declare class MessageFallbackJob implements OnModuleInit {
    private readonly queueService;
    private readonly logger;
    constructor(queueService: QueueService, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: MessageFallbackJobPayload): Promise<void>;
}
export {};
