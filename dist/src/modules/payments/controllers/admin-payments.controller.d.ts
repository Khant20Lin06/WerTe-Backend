import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminCancelPaymentDto } from '../dto/admin-cancel-payment.dto';
import { AdminConfirmPaymentDto } from '../dto/admin-confirm-payment.dto';
import { AdminFailPaymentDto } from '../dto/admin-fail-payment.dto';
import { PaymentSummaryDto } from '../dto/payment-summary.dto';
import { PaymentsRestService } from '../services/payments-rest.service';
export declare class AdminPaymentsController {
    private readonly paymentsRestService;
    constructor(paymentsRestService: PaymentsRestService);
    confirm(currentUser: AuthenticatedUserEntity, paymentId: string, body: AdminConfirmPaymentDto): Promise<PaymentSummaryDto>;
    fail(currentUser: AuthenticatedUserEntity, paymentId: string, body: AdminFailPaymentDto): Promise<PaymentSummaryDto>;
    cancel(currentUser: AuthenticatedUserEntity, paymentId: string, body: AdminCancelPaymentDto): Promise<PaymentSummaryDto>;
}
