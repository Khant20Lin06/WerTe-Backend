import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutPreviewEntity } from '../entities/checkout-preview.entity';
import { CheckoutContextService, ResolveCheckoutContextInput } from './checkout-context.service';
import { CheckoutPricingService } from './checkout-pricing.service';
export declare class CheckoutPreviewService {
    private readonly checkoutContextService;
    private readonly checkoutPricingService;
    constructor(checkoutContextService: CheckoutContextService, checkoutPricingService: CheckoutPricingService);
    previewCurrentCustomerCheckout(currentUser: AuthenticatedUserEntity, input: ResolveCheckoutContextInput): Promise<CheckoutPreviewEntity>;
}
