import { Module, forwardRef } from '@nestjs/common';

import { CheckoutModule } from '../checkout/checkout.module';
import { MessagingModule } from '../messaging/messaging.module';
import { MenusModule } from '../menus/menus.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { CustomerOrdersController } from './controllers/customer-orders.controller';
import { MerchantOrdersController } from './controllers/merchant-orders.controller';
import { RiderOrdersController } from './controllers/rider-orders.controller';
import { AdminOrderOperationsService } from './services/admin-order-operations.service';
import { OrderCancellationService } from './services/order-cancellation.service';
import { OrderCreationService } from './services/order-creation.service';
import { MerchantOrderHandlingService } from './services/merchant-order-handling.service';
import { OrderQueryService } from './services/order-query.service';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderPolicyService } from './policies/order-policy.service';

@Module({
  imports: [
    forwardRef(() => CheckoutModule),
    MessagingModule,
    MenusModule,
    NotificationsModule,
  ],
  controllers: [
    CustomerOrdersController,
    MerchantOrdersController,
    RiderOrdersController,
    AdminOrdersController,
  ],
  providers: [
    OrdersRepository,
    OrderCreationService,
    AdminOrderOperationsService,
    OrderQueryService,
    OrderCancellationService,
    MerchantOrderHandlingService,
    OrderPolicyService,
  ],
  exports: [
    OrderQueryService,
    OrdersRepository,
    OrderCreationService,
    OrderPolicyService,
  ],
})
export class OrdersModule {}
