import { PaymentDetailDto, PaymentSummaryDto } from '../dto/payment-summary.dto';
import { PaymentsRestService } from '../services/payments-rest.service';
export declare class AdminOrderPaymentsController {
    private readonly paymentsRestService;
    constructor(paymentsRestService: PaymentsRestService);
    list(orderId: string): Promise<PaymentSummaryDto[]>;
    detail(orderId: string, paymentId: string): Promise<PaymentDetailDto>;
}
