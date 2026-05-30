import { Module, forwardRef } from '@nestjs/common';

import { AddressesModule } from '../addresses/addresses.module';
import { BranchesModule } from '../branches/branches.module';
import { CartsModule } from '../carts/carts.module';
import { CustomerProfilesModule } from '../customer-profiles/customer-profiles.module';
import { MessagingModule } from '../messaging/messaging.module';
import { MenusModule } from '../menus/menus.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { CustomerCheckoutController } from './controllers/customer-checkout.controller';
import { CheckoutContextService } from './services/checkout-context.service';
import { CheckoutPreviewService } from './services/checkout-preview.service';
import { CheckoutPricingService } from './services/checkout-pricing.service';
import { CheckoutSubmissionService } from './services/checkout-submission.service';
import { CheckoutValidationService } from './services/checkout-validation.service';

@Module({
  imports: [
    CustomerProfilesModule,
    AddressesModule,
    BranchesModule,
    CartsModule,
    MenusModule,
    MessagingModule,
    NotificationsModule,
    PaymentsModule,
    PromotionsModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [CustomerCheckoutController],
  providers: [
    CheckoutValidationService,
    CheckoutContextService,
    CheckoutPricingService,
    CheckoutPreviewService,
    CheckoutSubmissionService,
  ],
  exports: [
    CheckoutValidationService,
    CheckoutContextService,
    CheckoutPricingService,
    CheckoutPreviewService,
    CheckoutSubmissionService,
  ],
})
export class CheckoutModule {}
