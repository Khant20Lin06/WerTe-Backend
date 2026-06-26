import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logging/app.logger';
import { DlqService } from './dlq.service';
import { QueueMetricsService } from '../metrics/queue-metrics.service';
type QueueJobStatus = 'queued' | 'processing' | 'completed' | 'failed';
type QueueJobHandler = (payload: unknown, job: QueueJobEntity) => Promise<void> | void;
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
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly queueMetrics;
    private readonly dlqService;
    private readonly handlers;
    private readonly queues;
    private readonly workers;
    private readonly connection;
    constructor(configService: ConfigService, logger: AppLogger, queueMetrics: QueueMetricsService, dlqService: DlqService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    registerHandler(queueName: string, jobName: string, handler: QueueJobHandler): void;
    listRegisteredHandlers(): Array<{
        queueName: string;
        jobName: string;
    }>;
    listJobs(_queueName?: string): QueueJobEntity[];
    add(queueName: string, jobName: string, payload: unknown, options?: {
        delayMs?: number;
    }): Promise<QueueJobEntity>;
    processDueJobs(_queueName?: string): Promise<QueueJobEntity[]>;
    processJob(jobId: string): Promise<QueueJobEntity>;
    private ensureQueue;
    private ensureWorker;
    private toHandlerKey;
}
export {};
