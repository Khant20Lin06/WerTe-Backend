import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { PaymentDetailDto, PaymentSummaryDto } from '../dto/payment-summary.dto';
import { PaymentsRestService } from '../services/payments-rest.service';
export declare class CustomerPaymentsController {
    private readonly paymentsRestService;
    constructor(paymentsRestService: PaymentsRestService);
    list(currentUser: AuthenticatedUserEntity, orderId: string): Promise<PaymentSummaryDto[]>;
    detail(currentUser: AuthenticatedUserEntity, orderId: string, paymentId: string): Promise<PaymentDetailDto>;
}
