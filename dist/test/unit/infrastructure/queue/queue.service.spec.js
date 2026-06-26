"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_service_1 = require("../../../../src/infrastructure/queue/queue.service");
jest.mock('bullmq');
jest.mock('ioredis', () => {
    const mock = jest.fn().mockImplementation(() => ({
        quit: jest.fn().mockResolvedValue('OK'),
        on: jest.fn(),
        disconnect: jest.fn(),
    }));
    return { default: mock, __esModule: true };
});
describe('QueueService', () => {
    let service;
    let mockQueue;
    let mockWorker;
    const makeLogger = () => ({
        debugEvent: jest.fn(),
        errorEvent: jest.fn(),
        warnEvent: jest.fn(),
        logEvent: jest.fn(),
    });
    const makeConfigService = () => ({
        getOrThrow: jest.fn().mockReturnValue('redis://localhost:6379'),
        get: jest.fn().mockReturnValue(5),
    });
    beforeEach(() => {
        mockQueue = {
            add: jest.fn().mockResolvedValue({ id: 'job_123' }),
            close: jest.fn().mockResolvedValue(undefined),
        };
        mockWorker = {
            on: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        };
        bullmq_1.Queue.mockImplementation(() => mockQueue);
        bullmq_1.Worker.mockImplementation(() => mockWorker);
        const makeQueueMetrics = () => ({
            jobDuration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
            jobCompletedTotal: { inc: jest.fn() },
            jobFailedTotal: { inc: jest.fn() },
            jobRetriedTotal: { inc: jest.fn() },
            dlqJobsTotal: { inc: jest.fn() },
        });
        const makeDlqService = () => ({
            push: jest.fn().mockResolvedValue(undefined),
            onModuleInit: jest.fn(),
        });
        service = new queue_service_1.QueueService(makeConfigService(), makeLogger(), makeQueueMetrics(), makeDlqService());
    });
    afterEach(async () => {
        await service.onModuleDestroy();
    });
    it('registers handlers and tracks them via listRegisteredHandlers()', () => {
        const handler = jest.fn();
        service.registerHandler('notifications', 'push-notification', handler);
        expect(service.listRegisteredHandlers()).toContainEqual({
            queueName: 'notifications',
            jobName: 'push-notification',
        });
        expect(bullmq_1.Worker).toHaveBeenCalledWith('notifications', expect.any(Function), expect.objectContaining({ concurrency: 5 }));
    });
    it('enqueues a job via BullMQ Queue.add() and returns a QueueJobEntity', async () => {
        const job = await service.add('notifications', 'push-notification', {
            notificationId: 'notification_1',
        });
        expect(mockQueue.add).toHaveBeenCalledWith('push-notification', expect.objectContaining({
            jobName: 'push-notification',
            payload: { notificationId: 'notification_1' },
        }), expect.objectContaining({ attempts: 3 }));
        expect(job).toMatchObject({
            queueName: 'notifications',
            jobName: 'push-notification',
            status: 'queued',
            payload: { notificationId: 'notification_1' },
        });
    });
    it('enqueues a delayed job with the correct delay option', async () => {
        await service.add('order-timeouts', 'start-timeout', { orderId: 'o_1' }, {
            delayMs: 30_000,
        });
        expect(mockQueue.add).toHaveBeenCalledWith('start-timeout', expect.any(Object), expect.objectContaining({ delay: 30_000 }));
    });
    it('listJobs() returns an empty array (BullMQ backend)', () => {
        expect(service.listJobs()).toEqual([]);
        expect(service.listJobs('notifications')).toEqual([]);
    });
    it('processDueJobs() is a no-op and returns an empty array', async () => {
        const result = await service.processDueJobs('notifications');
        expect(result).toEqual([]);
    });
    it('processJob() throws because workers own the job lifecycle', async () => {
        await expect(service.processJob('job_123')).rejects.toThrow('processJob');
    });
});
//# sourceMappingURL=queue.service.spec.js.map