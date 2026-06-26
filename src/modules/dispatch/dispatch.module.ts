import { Module, OnModuleInit } from '@nestjs/common';

import { DeliveriesModule } from '../deliveries/deliveries.module';
import { MessagingModule } from '../messaging/messaging.module';
import { OrdersModule } from '../orders/orders.module';
import { RidersModule } from '../riders/riders.module';
import { AdminDispatchController } from './controllers/admin-dispatch.controller';
import { DispatchRepository } from './repositories/dispatch.repository';
import { DispatchAssignmentService } from './services/dispatch-assignment.service';
import { AutoDispatchService } from './services/auto-dispatch.service';
import { DispatchQueryService } from './services/dispatch-query.service';

@Module({
  imports: [OrdersModule, DeliveriesModule, RidersModule, MessagingModule],
  controllers: [AdminDispatchController],
  providers: [
    DispatchRepository,
    DispatchQueryService,
    DispatchAssignmentService,
    AutoDispatchService,
  ],
  exports: [DispatchRepository, DispatchQueryService, DispatchAssignmentService, AutoDispatchService],
})
export class DispatchModule implements OnModuleInit {
  constructor(private readonly autoDispatchService: AutoDispatchService) {}

  onModuleInit(): void {
    this.autoDispatchService.registerHandlers();
  }
}
