import { Global, Module } from '@nestjs/common';

import { InventoryAlertDigestJob } from '../../jobs/inventory-alert-digest.job';
import { MessageFallbackJob } from '../../jobs/message-fallback.job';
import { OrderTimeoutJob } from '../../jobs/order-timeout.job';
import { PaymentProviderEventProcessingJob } from '../../jobs/payment-provider-event-processing.job';
import { ProviderWebhookReconciliationJob } from '../../jobs/provider-webhook-reconciliation.job';
import { PushNotificationJob } from '../../jobs/push-notification.job';
import { RefundProviderEventProcessingJob } from '../../jobs/refund-provider-event-processing.job';
import { RiderLocationCleanupJob } from '../../jobs/rider-location-cleanup.job';
import { NotificationModule } from '../notifications/notification.module';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { OrdersModule } from '../../modules/orders/orders.module';
import { PaymentsModule } from '../../modules/payments/payments.module';
import { RefundsModule } from '../../modules/refunds/refunds.module';
import { DlqService } from './dlq.service';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    NotificationModule,
    NotificationsModule,
    OrdersModule,
    PaymentsModule,
    RefundsModule,
  ],
  providers: [
    DlqService,
    QueueService,
    InventoryAlertDigestJob,
    PushNotificationJob,
    OrderTimeoutJob,
    MessageFallbackJob,
    RiderLocationCleanupJob,
    PaymentProviderEventProcessingJob,
    RefundProviderEventProcessingJob,
    ProviderWebhookReconciliationJob,
  ],
  exports: [QueueService, DlqService],
})
export class BullmqModule {}
