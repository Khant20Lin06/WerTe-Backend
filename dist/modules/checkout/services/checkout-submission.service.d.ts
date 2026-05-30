import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CartsRepository } from '../../carts/repositories/carts.repository';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { CheckoutSubmissionEntity } from '../entities/checkout-submission.entity';
import { CheckoutContextService } from './checkout-context.service';
import { CheckoutPricingService } from './checkout-pricing.service';
export type SubmitCheckoutInput = {
    branchId: string;
    addressId?: string;
    idempotencyKey: string;
};
export declare class CheckoutSubmissionService {
    private readonly prisma;
    private readonly checkoutContextService;
    private readonly checkoutPricingService;
    private readonly ordersRepository;
    private readonly cartsRepository;
    private readonly queueService;
    private readonly systemMessageService;
    constructor(prisma: PrismaService, checkoutContextService: CheckoutContextService, checkoutPricingService: CheckoutPricingService, ordersRepository: OrdersRepository, cartsRepository: CartsRepository, queueService: QueueService, systemMessageService: SystemMessageService);
    submitCurrentCustomerCheckout(currentUser: AuthenticatedUserEntity, input: SubmitCheckoutInput): Promise<CheckoutSubmissionEntity>;
    private buildOrderCode;
    private assertIdempotentOrderBelongsToCustomer;
    private tryResolveReplayAfterUniqueConstraint;
}
