import { AppLogger } from '../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../src/infrastructure/queue/queue.service';
import { OrderTimeoutJob } from '../../../src/jobs/order-timeout.job';
import { OrdersRepository } from '../../../src/modules/orders/repositories/orders.repository';

describe('OrderTimeoutJob', () => {
  it('registers the timeout handler and logs the current order status', async () => {
    const queueService = {
      registerHandler: jest.fn(),
    } as unknown as jest.Mocked<QueueService>;
    const ordersRepository = {
      findOrderDetailById: jest.fn().mockResolvedValue({
        status: 'PLACED',
      }),
    } as unknown as jest.Mocked<OrdersRepository>;
    const logger = {
      logEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const job = new OrderTimeoutJob(queueService, ordersRepository, logger);

    job.onModuleInit();
    await job.handle({
      orderId: 'order_1',
    });

    expect(queueService.registerHandler).toHaveBeenCalledWith(
      'order-timeouts',
      'start-timeout',
      expect.any(Function),
    );
    expect(ordersRepository.findOrderDetailById).toHaveBeenCalledWith('order_1');
    expect(logger.logEvent).toHaveBeenCalledWith(
      'Order timeout baseline job processed.',
      {
        orderId: 'order_1',
        status: 'PLACED',
      },
      'OrderTimeoutJob',
    );
  });
});
