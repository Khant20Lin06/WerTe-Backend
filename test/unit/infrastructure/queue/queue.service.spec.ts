import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { QueueService } from '../../../../src/infrastructure/queue/queue.service';

describe('QueueService', () => {
  const makeLogger = () =>
    ({
      debugEvent: jest.fn(),
      errorEvent: jest.fn(),
      warnEvent: jest.fn(),
    }) as unknown as jest.Mocked<AppLogger>;

  it('registers handlers and processes queued jobs immediately', async () => {
    const logger = makeLogger();
    const service = new QueueService(logger);
    const handler = jest.fn().mockResolvedValue(undefined);

    service.registerHandler('notifications', 'push-notification', handler);

    const job = await service.add('notifications', 'push-notification', {
      notificationId: 'notification_1',
    });

    await service.processDueJobs();

    expect(service.listRegisteredHandlers()).toContainEqual({
      queueName: 'notifications',
      jobName: 'push-notification',
    });
    expect(handler).toHaveBeenCalledWith(
      {
        notificationId: 'notification_1',
      },
      expect.objectContaining({
        id: job.id,
        jobName: 'push-notification',
        queueName: 'notifications',
      }),
    );
    expect(service.listJobs('notifications')).toEqual([
      expect.objectContaining({
        id: job.id,
        status: 'completed',
      }),
    ]);
  });

  it('marks queued jobs as failed when a handler throws', async () => {
    const logger = makeLogger();
    const service = new QueueService(logger);

    service.registerHandler('notifications', 'push-notification', async () => {
      throw new Error('job failed');
    });

    const job = await service.add('notifications', 'push-notification', {
      notificationId: 'notification_1',
    });

    await Promise.resolve();
    const [processedJob] = service.listJobs('notifications');

    expect(processedJob).toMatchObject({
      id: job.id,
      lastError: 'job failed',
      status: 'failed',
    });
    expect(logger.errorEvent).toHaveBeenCalled();
  });
});
