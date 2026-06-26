"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_timeout_job_1 = require("../../../src/jobs/order-timeout.job");
describe('OrderTimeoutJob', () => {
    it('registers the timeout handler and logs the current order status', async () => {
        const queueService = {
            registerHandler: jest.fn(),
        };
        const ordersRepository = {
            findOrderDetailById: jest.fn().mockResolvedValue({
                status: 'PLACED',
            }),
        };
        const logger = {
            logEvent: jest.fn(),
        };
        const job = new order_timeout_job_1.OrderTimeoutJob(queueService, ordersRepository, logger);
        job.onModuleInit();
        await job.handle({
            orderId: 'order_1',
        });
        expect(queueService.registerHandler).toHaveBeenCalledWith('order-timeouts', 'start-timeout', expect.any(Function));
        expect(ordersRepository.findOrderDetailById).toHaveBeenCalledWith('order_1');
        expect(logger.logEvent).toHaveBeenCalledWith('Order timeout baseline job processed.', {
            orderId: 'order_1',
            status: 'PLACED',
        }, 'OrderTimeoutJob');
    });
});
//# sourceMappingURL=order-timeout.job.spec.js.map