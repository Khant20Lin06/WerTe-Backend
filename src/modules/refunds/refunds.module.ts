import { Module } from '@nestjs/common';

import { MessagingModule } from '../messaging/messaging.module';
import { PaymentsModule } from '../payments/payments.module';
import { AdminOrderRefundsController } from './controllers/admin-order-refunds.controller';
import { AdminRefundsController } from './controllers/admin-refunds.controller';
import { CustomerRefundsController } from './controllers/customer-refunds.controller';
import { RefundsRepository } from './repositories/refunds.repository';
import { RefundProviderEventProcessorService } from './services/refund-provider-event-processor.service';
import { RefundProviderWebhookService } from './services/refund-provider-webhook.service';
import { RefundOperationsService } from './services/refund-operations.service';
import { RefundsRestService } from './services/refunds-rest.service';
import { RefundsService } from './services/refunds.service';

@Module({
  imports: [PaymentsModule, MessagingModule],
  controllers: [
    CustomerRefundsController,
    AdminOrderRefundsController,
    AdminRefundsController,
  ],
  providers: [
    RefundsRepository,
    RefundsService,
    RefundsRestService,
    RefundOperationsService,
    RefundProviderEventProcessorService,
    RefundProviderWebhookService,
  ],
  exports: [
    RefundsRepository,
    RefundsService,
    RefundsRestService,
    RefundOperationsService,
    RefundProviderEventProcessorService,
    RefundProviderWebhookService,
  ],
})
export class RefundsModule {}
