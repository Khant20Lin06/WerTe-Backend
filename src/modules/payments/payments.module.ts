import { Module } from '@nestjs/common';

import { MessagingModule } from '../messaging/messaging.module';
import { MenusModule } from '../menus/menus.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { AdminOrderPaymentsController } from './controllers/admin-order-payments.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { CustomerPaymentsController } from './controllers/customer-payments.controller';
import { CheckoutPaymentIntentService } from './services/checkout-payment-intent.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { PaymentLifecycleService } from './services/payment-lifecycle.service';
import { PaymentProviderEventProcessorService } from './services/payment-provider-event-processor.service';
import { PaymentProviderWebhookService } from './services/payment-provider-webhook.service';
import { PaymentsService } from './services/payments.service';
import { PaymentsRestService } from './services/payments-rest.service';
import { ProviderWebhookNormalizerService } from './services/provider-webhook-normalizer.service';
import { ProviderWebhookSignatureService } from './services/provider-webhook-signature.service';

@Module({
  imports: [MessagingModule, MenusModule, NotificationsModule],
  controllers: [
    CustomerPaymentsController,
    AdminOrderPaymentsController,
    AdminPaymentsController,
  ],
  providers: [
    OrdersRepository,
    PaymentsRepository,
    PaymentsService,
    PaymentsRestService,
    CheckoutPaymentIntentService,
    PaymentLifecycleService,
    PaymentProviderEventProcessorService,
    PaymentProviderWebhookService,
    ProviderWebhookNormalizerService,
    ProviderWebhookSignatureService,
  ],
  exports: [
    PaymentsRepository,
    PaymentsService,
    PaymentsRestService,
    CheckoutPaymentIntentService,
    PaymentLifecycleService,
    PaymentProviderEventProcessorService,
    PaymentProviderWebhookService,
    ProviderWebhookNormalizerService,
    ProviderWebhookSignatureService,
  ],
})
export class PaymentsModule {}
