import { PaymentProviderEventEntity } from '../entities/payment-provider-event.entity';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PaymentLifecycleService } from './payment-lifecycle.service';
type ProcessPaymentProviderEventInput = {
    paymentProviderEventId: string;
    occurredAt?: Date;
    retryTerminal?: boolean;
};
export declare class PaymentProviderEventProcessorService {
    private readonly paymentsRepository;
    private readonly paymentLifecycleService;
    constructor(paymentsRepository: PaymentsRepository, paymentLifecycleService: PaymentLifecycleService);
    processPaymentProviderEvent(input: ProcessPaymentProviderEventInput): Promise<PaymentProviderEventEntity>;
    private resolveLifecycleAction;
    private resolvePayment;
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
}
export {};
