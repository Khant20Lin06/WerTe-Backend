import { RefundProviderEventEntity } from '../entities/refund-provider-event.entity';
import { RefundsRepository } from '../repositories/refunds.repository';
import { RefundOperationsService } from './refund-operations.service';
type ProcessRefundProviderEventInput = {
    refundProviderEventId: string;
    occurredAt?: Date;
    retryTerminal?: boolean;
};
export declare class RefundProviderEventProcessorService {
    private readonly refundsRepository;
    private readonly refundOperationsService;
    constructor(refundsRepository: RefundsRepository, refundOperationsService: RefundOperationsService);
    processRefundProviderEvent(input: ProcessRefundProviderEventInput): Promise<RefundProviderEventEntity>;
    private resolveLifecycleAction;
    private resolveRefund;
    private applyLifecycleAction;
    private markProcessed;
    private markIgnored;
    private markFailed;
    private buildLifecycleMetadata;
    private buildProcessingMetadata;
    private buildReasonCode;
    private buildLifecycleNote;
    private toOptionalInputJson;
    private readFailureCode;
    private readFailureMessage;
    private asJsonObject;
}
export {};
