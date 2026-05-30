import { Injectable, OnModuleInit } from '@nestjs/common';

import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueJobNames, QueueNames } from '../infrastructure/queue/queue.constants';
import { QueueService } from '../infrastructure/queue/queue.service';
import { OrdersRepository } from '../modules/orders/repositories/orders.repository';

type OrderTimeoutJobPayload = {
  orderId: string;
};

@Injectable()
export class OrderTimeoutJob implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly ordersRepository: OrdersRepository,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    this.queueService.registerHandler(
      QueueNames.orderTimeouts,
      QueueJobNames.orderTimeouts.startTimeout,
      (payload) => this.handle(payload as OrderTimeoutJobPayload),
    );
  }

  async handle(payload: OrderTimeoutJobPayload) {
    const order = await this.ordersRepository.findOrderDetailById(payload.orderId);

    this.logger.logEvent(
      'Order timeout baseline job processed.',
      {
        orderId: payload.orderId,
        status: order?.status ?? 'missing',
      },
      'OrderTimeoutJob',
    );
  }
}
