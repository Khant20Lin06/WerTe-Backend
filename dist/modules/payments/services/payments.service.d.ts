import { PaymentAttemptEntity } from '../entities/payment-attempt.entity';
import { PaymentSummaryEntity } from '../entities/payment-summary.entity';
import { PaymentsRepository } from '../repositories/payments.repository';
export declare class PaymentsService {
    private readonly paymentsRepository;
    constructor(paymentsRepository: PaymentsRepository);
    findPaymentById(paymentId: string): Promise<PaymentSummaryEntity | null>;
    findOrderPayment(orderId: string, paymentId: string): Promise<PaymentSummaryEntity | null>;
    findCustomerPayment(customerProfileId: string, paymentId: string): Promise<PaymentSummaryEntity | null>;
    listOrderPayments(orderId: string): Promise<PaymentSummaryEntity[]>;
    listCustomerOrderPayments(orderId: string, customerProfileId: string): Promise<PaymentSummaryEntity[]>;
    findLatestOrderPayment(orderId: string): Promise<PaymentSummaryEntity | null>;
    listPaymentAttempts(paymentId: string): Promise<PaymentAttemptEntity[]>;
}
