import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { PaymentDetailEntity } from '../entities/payment-detail.entity';
import { PaymentSummaryEntity } from '../entities/payment-summary.entity';
import { PaymentLifecycleService } from './payment-lifecycle.service';
import { PaymentsService } from './payments.service';
export declare class PaymentsRestService {
    private readonly paymentsService;
    private readonly paymentLifecycleService;
    constructor(paymentsService: PaymentsService, paymentLifecycleService: PaymentLifecycleService);
    listCurrentCustomerOrderPayments(currentUser: AuthenticatedUserEntity, orderId: string): Promise<PaymentSummaryEntity[]>;
    getCurrentCustomerOrderPaymentDetail(currentUser: AuthenticatedUserEntity, orderId: string, paymentId: string): Promise<PaymentDetailEntity>;
    listCurrentAdminOrderPayments(orderId: string): Promise<PaymentSummaryEntity[]>;
    getCurrentAdminOrderPaymentDetail(orderId: string, paymentId: string): Promise<PaymentDetailEntity>;
    confirmCurrentAdminPayment(currentUser: AuthenticatedUserEntity, paymentId: string, payload: {
        providerReference?: string | null;
        providerReceiptId?: string | null;
        reasonCode?: string | null;
        note?: string | null;
    }): Promise<PaymentSummaryEntity>;
    failCurrentAdminPayment(currentUser: AuthenticatedUserEntity, paymentId: string, payload: {
        providerReference?: string | null;
        reasonCode?: string | null;
        failureCode?: string | null;
        failureMessage?: string | null;
        note?: string | null;
    }): Promise<PaymentSummaryEntity>;
    cancelCurrentAdminPayment(currentUser: AuthenticatedUserEntity, paymentId: string, payload: {
        providerReference?: string | null;
        reasonCode?: string | null;
        note?: string | null;
    }): Promise<PaymentSummaryEntity>;
    private attachAttempts;
}
