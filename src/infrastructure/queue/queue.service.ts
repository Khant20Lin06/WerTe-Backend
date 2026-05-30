import { Injectable } from '@nestjs/common';

import { AppLogger } from '../logging/app.logger';

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

@Injectable()
export class QueueService {
  private readonly handlers = new Map<string, QueueJobHandler>();

  private readonly jobs = new Map<
    string,
    {
      id: string;
      queueName: string;
      jobName: string;
      payload: unknown;
      status: QueueJobStatus;
      attempts: number;
      createdAt: Date;
      availableAt: Date;
      processedAt: Date | null;
      completedAt: Date | null;
      failedAt: Date | null;
      lastError: string | null;
    }
  >();

  constructor(private readonly logger: AppLogger) {}

  registerHandler(
    queueName: string,
    jobName: string,
    handler: QueueJobHandler,
  ): void {
    this.handlers.set(this.toHandlerKey(queueName, jobName), handler);
    this.logger.debugEvent(
      'Queue handler registered.',
      {
        jobName,
        queueName,
      },
      'QueueService',
    );
  }

  listRegisteredHandlers(): Array<{ queueName: string; jobName: string }> {
    return Array.from(this.handlers.keys()).map((key) => {
      const [queueName, jobName] = key.split('::');

      return {
        queueName,
        jobName,
      };
    });
  }

  listJobs(queueName?: string): QueueJobEntity[] {
    return Array.from(this.jobs.values())
      .filter((job) => queueName === undefined || job.queueName === queueName)
      .sort(
        (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
      )
      .map((job) => this.serializeJob(job));
  }

  async add(
    queueName: string,
    jobName: string,
    payload: unknown,
    options?: { delayMs?: number },
  ): Promise<QueueJobEntity> {
    const now = new Date();
    const delayMs = Math.max(options?.delayMs ?? 0, 0);
    const availableAt = new Date(now.getTime() + delayMs);
    const id = this.buildJobId();
    const job = {
      id,
      queueName,
      jobName,
      payload,
      status: 'queued' as const,
      attempts: 0,
      createdAt: now,
      availableAt,
      processedAt: null,
      completedAt: null,
      failedAt: null,
      lastError: null,
    };

    this.jobs.set(id, job);
    this.logger.debugEvent(
      'Queue job enqueued.',
      {
        availableAt: availableAt.toISOString(),
        id,
        jobName,
        queueName,
      },
      'QueueService',
    );
    this.schedule(id, delayMs);

    return this.serializeJob(job);
  }

  async processDueJobs(queueName?: string): Promise<QueueJobEntity[]> {
    const now = Date.now();
    const dueJobs = Array.from(this.jobs.values()).filter(
      (job) =>
        job.status === 'queued' &&
        job.availableAt.getTime() <= now &&
        (queueName === undefined || job.queueName === queueName),
    );

    const processedJobs: QueueJobEntity[] = [];

    for (const job of dueJobs) {
      processedJobs.push(await this.processJob(job.id));
    }

    return processedJobs;
  }

  async processJob(jobId: string): Promise<QueueJobEntity> {
    const job = this.jobs.get(jobId);

    if (job === undefined) {
      throw new Error(`Queue job ${jobId} was not found.`);
    }

    if (job.status !== 'queued') {
      return this.serializeJob(job);
    }

    if (job.availableAt.getTime() > Date.now()) {
      return this.serializeJob(job);
    }

    const handler = this.handlers.get(this.toHandlerKey(job.queueName, job.jobName));

    if (handler === undefined) {
      this.logger.warnEvent(
        'Queue job has no registered handler.',
        {
          id: job.id,
          jobName: job.jobName,
          queueName: job.queueName,
        },
        'QueueService',
      );

      return this.serializeJob(job);
    }

    job.status = 'processing';
    job.attempts += 1;
    job.processedAt = new Date();

    try {
      await handler(job.payload, this.serializeJob(job));
      job.status = 'completed';
      job.completedAt = new Date();
      this.logger.debugEvent(
        'Queue job completed.',
        {
          id: job.id,
          jobName: job.jobName,
          queueName: job.queueName,
        },
        'QueueService',
      );
    } catch (error) {
      job.status = 'failed';
      job.failedAt = new Date();
      job.lastError = error instanceof Error ? error.message : String(error);
      this.logger.errorEvent(
        'Queue job failed.',
        {
          id: job.id,
          jobName: job.jobName,
          lastError: job.lastError,
          queueName: job.queueName,
        },
        'QueueService',
      );
    }

    return this.serializeJob(job);
  }

  private schedule(jobId: string, delayMs: number): void {
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        void this.processJob(jobId);
      }, delayMs);

      timer.unref?.();
      return;
    }

    queueMicrotask(() => {
      void this.processJob(jobId);
    });
  }

  private buildJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private toHandlerKey(queueName: string, jobName: string): string {
    return `${queueName}::${jobName}`;
  }

  private serializeJob(job: {
    id: string;
    queueName: string;
    jobName: string;
    payload: unknown;
    status: QueueJobStatus;
    attempts: number;
    createdAt: Date;
    availableAt: Date;
    processedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    lastError: string | null;
  }): QueueJobEntity {
    return {
      id: job.id,
      queueName: job.queueName,
      jobName: job.jobName,
      payload: job.payload,
      status: job.status,
      attempts: job.attempts,
      createdAt: job.createdAt.toISOString(),
      availableAt: job.availableAt.toISOString(),
      processedAt: job.processedAt?.toISOString() ?? null,
      completedAt: job.completedAt?.toISOString() ?? null,
      failedAt: job.failedAt?.toISOString() ?? null,
      lastError: job.lastError,
    };
  }
}
