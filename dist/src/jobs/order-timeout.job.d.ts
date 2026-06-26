import { OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../infrastructure/logging/app.logger';
import { QueueService } from '../infrastructure/queue/queue.service';
import { OrdersRepository } from '../modules/orders/repositories/orders.repository';
type OrderTimeoutJobPayload = {
    orderId: string;
};
export declare class OrderTimeoutJob implements OnModuleInit {
    private readonly queueService;
    private readonly ordersRepository;
    private readonly logger;
    constructor(queueService: QueueService, ordersRepository: OrdersRepository, logger: AppLogger);
    onModuleInit(): void;
    handle(payload: OrderTimeoutJobPayload): Promise<void>;
}
export {};
