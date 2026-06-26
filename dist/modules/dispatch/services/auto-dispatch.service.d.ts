import { AppLogger } from '../../../infrastructure/logging/app.logger';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DeliveriesRepository } from '../../deliveries/repositories/deliveries.repository';
import { SystemMessageService } from '../../messaging/services/system-message.service';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { RidersService } from '../../riders/services/riders.service';
import { DispatchRepository } from '../repositories/dispatch.repository';
export declare class AutoDispatchService {
    private readonly logger;
    private readonly queueService;
    private readonly prisma;
    private readonly dispatchRepository;
    private readonly ordersRepository;
    private readonly deliveriesRepository;
    private readonly ridersService;
    private readonly systemMessageService;
    constructor(logger: AppLogger, queueService: QueueService, prisma: PrismaService, dispatchRepository: DispatchRepository, ordersRepository: OrdersRepository, deliveriesRepository: DeliveriesRepository, ridersService: RidersService, systemMessageService: SystemMessageService);
    enqueueForOrder(orderId: string): Promise<unknown>;
    enqueueForRider(riderId: string, township: string | null): Promise<unknown>;
    registerHandlers(): void;
    private handleAutoDispatchOrder;
    private handleAutoDispatchForRider;
    private pickEligibleRider;
    private assignAndNotify;
}
