import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';

import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { DlqService } from '../../../../src/infrastructure/queue/dlq.service';
import { QueueMetricsService } from '../../../../src/infrastructure/metrics/queue-metrics.service';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';

// BullMQ classes and ioredis are mocked — no real Redis connection needed.
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
  let service: QueueService;
  let mockQueue: jest.Mocked<Queue>;
  let mockWorker: jest.Mocked<Worker>;

  const makeLogger = () =>
    ({
      debugEvent: jest.fn(),
      errorEvent: jest.fn(),
      warnEvent: jest.fn(),
      logEvent: jest.fn(),
    }) as unknown as jest.Mocked<AppLogger>;

  const makeConfigService = () =>
    ({
      getOrThrow: jest.fn().mockReturnValue('redis://localhost:6379'),
      get: jest.fn().mockReturnValue(5),
    }) as unknown as jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job_123' }),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Queue>;

    mockWorker = {
      on: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Worker>;

    (Queue as jest.MockedClass<typeof Queue>).mockImplementation(
      () => mockQueue,
    );
    (Worker as jest.MockedClass<typeof Worker>).mockImplementation(
      () => mockWorker,
    );

    const makeQueueMetrics = () =>
      ({
        jobDuration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
        jobCompletedTotal: { inc: jest.fn() },
        jobFailedTotal: { inc: jest.fn() },
        jobRetriedTotal: { inc: jest.fn() },
        dlqJobsTotal: { inc: jest.fn() },
      }) as unknown as jest.Mocked<QueueMetricsService>;

    const makeDlqService = () =>
      ({
        push: jest.fn().mockResolvedValue(undefined),
        onModuleInit: jest.fn(),
      }) as unknown as jest.Mocked<DlqService>;

    service = new QueueService(makeConfigService(), makeLogger(), makeQueueMetrics(), makeDlqService());
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
    // A Worker must be created for the queue when a handler is registered.
    expect(Worker).toHaveBeenCalledWith(
      'notifications',
      expect.any(Function),
      expect.objectContaining({ concurrency: 5 }),
    );
  });

  it('enqueues a job via BullMQ Queue.add() and returns a QueueJobEntity', async () => {
    const job = await service.add('notifications', 'push-notification', {
      notificationId: 'notification_1',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'push-notification',
      expect.objectContaining({
        jobName: 'push-notification',
        payload: { notificationId: 'notification_1' },
      }),
      expect.objectContaining({ attempts: 3 }),
    );
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

    expect(mockQueue.add).toHaveBeenCalledWith(
      'start-timeout',
      expect.any(Object),
      expect.objectContaining({ delay: 30_000 }),
    );
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
    await expect(service.processJob('job_123')).rejects.toThrow(
      'processJob',
    );
  });
});
