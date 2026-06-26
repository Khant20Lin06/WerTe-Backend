import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
import { PaymentProviderEventProcessorService } from '../modules/payments/services/payment-provider-event-processor.service';
export type PaymentProviderEventProcessingJobPayload = {
    paymentProviderEventId: string;
    retryTerminal?: boolean;
};
export declare class PaymentProviderEventProcessingJob implements OnModuleInit {
    private readonly queueService;
    private readonly paymentProviderEventProcessorService;
    private readonly logger;
    constructor(queueService: QueueService, paymentProviderEventProcessorService: PaymentProviderEventProcessorService, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: PaymentProviderEventProcessingJobPayload): Promise<void>;
}
