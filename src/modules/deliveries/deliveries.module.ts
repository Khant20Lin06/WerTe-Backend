import { Module } from '@nestjs/common';

import { MessagingModule } from '../messaging/messaging.module';
import { OrdersModule } from '../orders/orders.module';
import { RiderDeliveriesController } from './controllers/rider-deliveries.controller';
import { DeliveriesRepository } from './repositories/deliveries.repository';
import { RiderDeliveryActionsService } from './services/rider-delivery-actions.service';
import { DeliveryQueryService } from './services/delivery-query.service';

@Module({
  imports: [OrdersModule, MessagingModule],
  controllers: [RiderDeliveriesController],
  providers: [
    DeliveriesRepository,
    DeliveryQueryService,
    RiderDeliveryActionsService,
  ],
  exports: [
    DeliveriesRepository,
    DeliveryQueryService,
    RiderDeliveryActionsService,
  ],
})
export class DeliveriesModule {}
