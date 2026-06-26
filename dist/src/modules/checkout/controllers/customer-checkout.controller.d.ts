import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutPreviewDto } from '../dto/checkout-preview.dto';
import { PreviewCheckoutDto } from '../dto/preview-checkout.dto';
import { CheckoutPreviewService } from '../services/checkout-preview.service';
export declare class CustomerCheckoutController {
    private readonly checkoutPreviewService;
    constructor(checkoutPreviewService: CheckoutPreviewService);
    preview(currentUser: AuthenticatedUserEntity, body: PreviewCheckoutDto): Promise<CheckoutPreviewDto>;
}
