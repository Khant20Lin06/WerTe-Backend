import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
import { PaymentsRepository } from '../modules/payments/repositories/payments.repository';
import { RefundsRepository } from '../modules/refunds/repositories/refunds.repository';
export type ProviderWebhookReconciliationJobPayload = {
    limit?: number;
};
export declare class ProviderWebhookReconciliationJob implements OnModuleInit {
    private readonly queueService;
    private readonly paymentsRepository;
    private readonly refundsRepository;
    private readonly logger;
    private static readonly defaultLimit;
    constructor(queueService: QueueService, paymentsRepository: PaymentsRepository, refundsRepository: RefundsRepository, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: ProviderWebhookReconciliationJobPayload): Promise<void>;
    private resolveLimit;
}
