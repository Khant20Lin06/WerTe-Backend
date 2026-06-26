"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const crypto_1 = require("crypto");
const ioredis_1 = require("ioredis");
const app_logger_1 = require("../logging/app.logger");
const dlq_service_1 = require("./dlq.service");
const queue_metrics_service_1 = require("../metrics/queue-metrics.service");
let QueueService = class QueueService {
    constructor(configService, logger, queueMetrics, dlqService) {
        this.configService = configService;
        this.logger = logger;
        this.queueMetrics = queueMetrics;
        this.dlqService = dlqService;
        this.handlers = new Map();
        this.queues = new Map();
        this.workers = new Map();
        this.connection = new ioredis_1.default(this.configService.getOrThrow('redis.url'), {
            keyPrefix: '',
            maxRetriesPerRequest: null,
        });
    }
    onModuleInit() {
    }
    async onModuleDestroy() {
        await Promise.all([
            ...Array.from(this.workers.values()).map((w) => w.close()),
            ...Array.from(this.queues.values()).map((q) => q.close()),
        ]);
        await this.connection.quit();
    }
    registerHandler(queueName, jobName, handler) {
        this.handlers.set(this.toHandlerKey(queueName, jobName), handler);
        this.ensureWorker(queueName);
        this.logger.debugEvent('Queue handler registered.', { jobName, queueName }, 'QueueService');
    }
    listRegisteredHandlers() {
        return Array.from(this.handlers.keys()).map((key) => {
            const [queueName, jobName] = key.split('::');
            return { queueName, jobName };
        });
    }
    listJobs(_queueName) {
        return [];
    }
    async add(queueName, jobName, payload, options) {
        const queue = this.ensureQueue(queueName);
        const now = new Date();
        const delayMs = Math.max(options?.delayMs ?? 0, 0);
        const availableAt = new Date(now.getTime() + delayMs);
        const jobId = (0, crypto_1.randomUUID)();
        const data = {
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
        this.logger.debugEvent('Queue job enqueued.', { availableAt: availableAt.toISOString(), id: jobId, jobName, queueName }, 'QueueService');
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
    async processDueJobs(_queueName) {
        return [];
    }
    async processJob(jobId) {
        throw new Error(`processJob('${jobId}') is not supported with the BullMQ backend. ` +
            'Workers process jobs automatically.');
    }
    ensureQueue(queueName) {
        const existing = this.queues.get(queueName);
        if (existing !== undefined)
            return existing;
        const queue = new bullmq_1.Queue(queueName, {
            connection: this.connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5_000 },
            },
        });
        this.queues.set(queueName, queue);
        return queue;
    }
    ensureWorker(queueName) {
        if (this.workers.has(queueName))
            return;
        const worker = new bullmq_1.Worker(queueName, async (job) => {
            const { jobName, payload, createdAt, availableAt } = job.data;
            const handlerKey = this.toHandlerKey(queueName, jobName);
            const handler = this.handlers.get(handlerKey);
            if (handler === undefined) {
                this.logger.warnEvent('Queue job has no registered handler.', { id: job.id, jobName, queueName }, 'QueueService');
                return;
            }
            const entity = {
                id: job.id ?? (0, crypto_1.randomUUID)(),
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
            this.logger.debugEvent('Queue job completed.', { id: job.id, jobName, queueName }, 'QueueService');
        }, {
            connection: this.connection,
            concurrency: this.configService.get('WORKER_CONCURRENCY', 5),
        });
        worker.on('failed', (job, error) => {
            const jobName = job?.data.jobName ?? 'unknown';
            const attemptsMade = job?.attemptsMade ?? 0;
            const maxAttempts = job?.opts.attempts ?? 1;
            this.queueMetrics.jobFailedTotal.inc({ queue: queueName, job_name: jobName });
            const isExhausted = attemptsMade >= maxAttempts;
            if (!isExhausted) {
                this.queueMetrics.jobRetriedTotal.inc({ queue: queueName, job_name: jobName });
            }
            this.logger.errorEvent('Queue job failed.', {
                id: job?.id,
                jobName,
                queueName,
                lastError: error.message,
                attempts: attemptsMade,
                exhausted: isExhausted,
            }, 'QueueService');
            if (isExhausted && job !== undefined) {
                this.queueMetrics.dlqJobsTotal.inc({ queue: queueName, job_name: jobName });
                this.dlqService.push({
                    id: job.id ?? (0, crypto_1.randomUUID)(),
                    queueName,
                    jobName,
                    payload: job.data.payload,
                    failedAt: new Date().toISOString(),
                    lastError: error.message,
                    attempts: attemptsMade,
                    createdAt: job.data.createdAt,
                }).catch((dlqErr) => {
                    this.logger.errorEvent('Failed to push exhausted job to DLQ.', { id: job.id, jobName, queueName, error: String(dlqErr) }, 'QueueService');
                });
            }
        });
        this.workers.set(queueName, worker);
    }
    toHandlerKey(queueName, jobName) {
        return `${queueName}::${jobName}`;
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        app_logger_1.AppLogger,
        queue_metrics_service_1.QueueMetricsService,
        dlq_service_1.DlqService])
], QueueService);
//# sourceMappingURL=queue.service.js.map