import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutSubmissionService } from '../../checkout/services/checkout-submission.service';
import { CreateOrderDto } from '../dto/create-order.dto';
export declare class OrderCreationService {
    private readonly checkoutSubmissionService;
    constructor(checkoutSubmissionService: CheckoutSubmissionService);
    create(currentUser: AuthenticatedUserEntity, dto: CreateOrderDto): Promise<import("../../checkout/entities/checkout-submission.entity").CheckoutSubmissionEntity>;
}
