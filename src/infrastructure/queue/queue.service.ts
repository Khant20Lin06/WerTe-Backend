import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
import { randomUUID } from 'crypto';
import IORedis from 'ioredis';

import { AppLogger } from '../logging/app.logger';
import { DlqService } from './dlq.service';
import { QueueMetricsService } from '../metrics/queue-metrics.service';

type QueueJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

type QueueJobHandler = (
  payload: unknown,
  job: QueueJobEntity,
) => Promise<void> | void;

export type QueueJobEntity = {
  id: string;
  queueName: string;
  jobName: string;
  payload: unknown;
  status: QueueJobStatus;
  attempts: number;
  createdAt: string;
  availableAt: string;
  processedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  lastError: string | null;
};

type BullJobData = {
  jobName: string;
  payload: unknown;
  createdAt: string;
  availableAt: string;
};

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly handlers = new Map<string, QueueJobHandler>();
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private readonly connection: IORedis;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
    private readonly queueMetrics: QueueMetricsService,
    private readonly dlqService: DlqService,
  ) {
    // Dedicated ioredis connection for BullMQ (separate from RedisService
    // so BullMQ can manage its own blocking commands without interference).
    this.connection = new IORedis(
      this.configService.getOrThrow<string>('redis.url'),
      {
        keyPrefix: '',
        maxRetriesPerRequest: null,
      },
    );

    // An ioredis client emitting 'error' with no listener attached throws
    // synchronously and crashes the whole process (standard EventEmitter
    // behavior) — confirmed live: stopping Redis crashed this container via
    // an uncaught ETIMEDOUT before this handler existed. BullMQ keeps
    // retrying/reconnecting on its own; this only stops that reconnect
    // cycle from taking the process down with it.
    this.connection.on('error', (error) => {
      this.logger.warnEvent(
        'BullMQ Redis connection error.',
        { error: String(error) },
        'QueueService',
      );
    });
  }

  onModuleInit(): void {
    // Workers are created lazily in registerHandler() once handlers are known.
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      ...Array.from(this.workers.values()).map((w) => w.close()),
      ...Array.from(this.queues.values()).map((q) => q.close()),
    ]);
    await this.connection.quit();
  }

  registerHandler(
    queueName: string,
    jobName: string,
    handler: QueueJobHandler,
  ): void {
    this.handlers.set(this.toHandlerKey(queueName, jobName), handler);
    this.ensureWorker(queueName);

    this.logger.debugEvent(
      'Queue handler registered.',
      { jobName, queueName },
      'QueueService',
    );
  }

  listRegisteredHandlers(): Array<{ queueName: string; jobName: string }> {
    return Array.from(this.handlers.keys()).map((key) => {
      const [queueName, jobName] = key.split('::');
      return { queueName, jobName };
    });
  }

  // listJobs() is a best-effort convenience method — BullMQ does not expose
  // a unified cross-queue list, so we return an empty array here. Use the
  // Bull Board UI or BullMQ's queue.getJobs() for operational visibility.
  listJobs(_queueName?: string): QueueJobEntity[] {
    return [];
  }

  async add(
    queueName: string,
    jobName: string,
    payload: unknown,
    options?: { delayMs?: number },
  ): Promise<QueueJobEntity> {
    const queue = this.ensureQueue(queueName);
    const now = new Date();
    const delayMs = Math.max(options?.delayMs ?? 0, 0);
    const availableAt = new Date(now.getTime() + delayMs);
    const jobId = randomUUID();

    const data: BullJobData = {
      jobName,
      payload,
      createdAt: now.toISOString(),
      availableAt: availableAt.toISOString(),
    };

    await queue.add(jobName, data, {
      jobId,
      delay: delayMs > 0 ? delayMs : undefined,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 60 * 60 * 24 },
      removeOnFail: { age: 60 * 60 * 24 * 7 },
    });

    this.logger.debugEvent(
      'Queue job enqueued.',
      { availableAt: availableAt.toISOString(), id: jobId, jobName, queueName },
      'QueueService',
    );

    return {
      id: jobId,
      queueName,
      jobName,
      payload,
      status: 'queued',
      attempts: 0,
      createdAt: now.toISOString(),
      availableAt: availableAt.toISOString(),
      processedAt: null,
      completedAt: null,
      failedAt: null,
      lastError: null,
    };
  }

  // processDueJobs() existed on the in-memory implementation for manual
  // triggering in tests. BullMQ workers process jobs automatically, so
  // this is a no-op in production. Tests should use real queues or mock
  // QueueService entirely.
  async processDueJobs(_queueName?: string): Promise<QueueJobEntity[]> {
    return [];
  }

  // processJob() is not meaningful with BullMQ — workers own job lifecycle.
  async processJob(jobId: string): Promise<QueueJobEntity> {
    throw new Error(
      `processJob('${jobId}') is not supported with the BullMQ backend. ` +
        'Workers process jobs automatically.',
    );
  }

  private ensureQueue(queueName: string): Queue {
    const existing = this.queues.get(queueName);
    if (existing !== undefined) return existing;

    const queue = new Queue(queueName, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
      },
    });

    this.queues.set(queueName, queue);
    return queue;
  }

  private ensureWorker(queueName: string): void {
    if (this.workers.has(queueName)) return;

    const worker = new Worker<BullJobData>(
      queueName,
      async (job: Job<BullJobData>) => {
        const { jobName, payload, createdAt, availableAt } = job.data;
        const handlerKey = this.toHandlerKey(queueName, jobName);
        const handler = this.handlers.get(handlerKey);

        if (handler === undefined) {
          this.logger.warnEvent(
            'Queue job has no registered handler.',
            { id: job.id, jobName, queueName },
            'QueueService',
          );
          return;
        }

        const entity: QueueJobEntity = {
          id: job.id ?? randomUUID(),
          queueName,
          jobName,
          payload,
          status: 'processing',
          attempts: job.attemptsMade,
          createdAt,
          availableAt,
          processedAt: new Date().toISOString(),
          completedAt: null,
          failedAt: null,
          lastError: null,
        };

        const endJobTimer = this.queueMetrics.jobDuration.startTimer({
          queue: queueName,
          job_name: jobName,
        });

        await handler(payload, entity);
        endJobTimer();

        this.queueMetrics.jobCompletedTotal.inc({ queue: queueName, job_name: jobName });
        this.logger.debugEvent(
          'Queue job completed.',
          { id: job.id, jobName, queueName },
          'QueueService',
        );
      },
      {
        connection: this.connection,
        concurrency: this.configService.get<number>('WORKER_CONCURRENCY', 5),
      },
    );

    worker.on('failed', (job, error) => {
      const jobName = job?.data.jobName ?? 'unknown';
      const attemptsMade = job?.attemptsMade ?? 0;
      const maxAttempts = job?.opts.attempts ?? 1;

      this.queueMetrics.jobFailedTotal.inc({ queue: queueName, job_name: jobName });

      const isExhausted = attemptsMade >= maxAttempts;
      if (!isExhausted) {
        this.queueMetrics.jobRetriedTotal.inc({ queue: queueName, job_name: jobName });
      }

      this.logger.errorEvent(
        'Queue job failed.',
        {
          id: job?.id,
          jobName,
          queueName,
          lastError: error.message,
          attempts: attemptsMade,
          exhausted: isExhausted,
        },
        'QueueService',
      );

      if (isExhausted && job !== undefined) {
        this.queueMetrics.dlqJobsTotal.inc({ queue: queueName, job_name: jobName });
        this.dlqService.push({
          id: job.id ?? randomUUID(),
          queueName,
          jobName,
          payload: job.data.payload,
          failedAt: new Date().toISOString(),
          lastError: error.message,
          attempts: attemptsMade,
          createdAt: job.data.createdAt,
        }).catch((dlqErr: unknown) => {
          this.logger.errorEvent(
            'Failed to push exhausted job to DLQ.',
            { id: job.id, jobName, queueName, error: String(dlqErr) },
            'QueueService',
          );
        });
      }
    });

    this.workers.set(queueName, worker);
  }

  private toHandlerKey(queueName: string, jobName: string): string {
    return `${queueName}::${jobName}`;
  }
}
