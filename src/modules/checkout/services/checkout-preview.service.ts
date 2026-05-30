import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CheckoutPreviewEntity } from '../entities/checkout-preview.entity';
import {
  CheckoutContextService,
  ResolveCheckoutContextInput,
} from './checkout-context.service';
import { CheckoutPricingService } from './checkout-pricing.service';

export type PreviewCurrentCustomerCheckoutInput = ResolveCheckoutContextInput & {
  promotionCode?: string;
};

@Injectable()
export class CheckoutPreviewService {
  constructor(
    private readonly checkoutContextService: CheckoutContextService,
    private readonly checkoutPricingService: CheckoutPricingService,
  ) {}

  async previewCurrentCustomerCheckout(
    currentUser: AuthenticatedUserEntity,
    input: PreviewCurrentCustomerCheckoutInput,
  ): Promise<CheckoutPreviewEntity> {
    const context =
      await this.checkoutContextService.getValidatedCurrentCustomerCheckoutContext(
        currentUser,
        input,
      );

    return this.checkoutPricingService.buildCheckoutPreview(context, {
      promotionCode: input.promotionCode,
    });
  }
}
