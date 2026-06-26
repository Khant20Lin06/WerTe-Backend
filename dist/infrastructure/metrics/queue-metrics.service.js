"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueMetricsService = void 0;
const common_1 = require("@nestjs/common");
const metrics_registry_1 = require("./metrics.registry");
let QueueMetricsService = class QueueMetricsService {
    constructor() {
        this.jobDuration = (0, metrics_registry_1.getOrCreateHistogram)({
            name: 'queue_job_duration_seconds',
            help: 'BullMQ job processing duration in seconds',
            labelNames: ['queue', 'job_name'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30, 60],
        });
        this.jobCompletedTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'queue_jobs_completed_total',
            help: 'Total number of BullMQ jobs completed successfully',
            labelNames: ['queue', 'job_name'],
        });
        this.jobFailedTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'queue_jobs_failed_total',
            help: 'Total number of BullMQ jobs that failed',
            labelNames: ['queue', 'job_name'],
        });
        this.jobRetriedTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'queue_jobs_retried_total',
            help: 'Total number of BullMQ job retry attempts',
            labelNames: ['queue', 'job_name'],
        });
        this.dlqJobsTotal = (0, metrics_registry_1.getOrCreateCounter)({
            name: 'queue_dlq_jobs_total',
            help: 'Total number of jobs moved to the dead-letter queue after exhausting retries',
            labelNames: ['queue', 'job_name'],
        });
    }
};
exports.QueueMetricsService = QueueMetricsService;
exports.QueueMetricsService = QueueMetricsService = __decorate([
    (0, common_1.Injectable)()
], QueueMetricsService);
//# sourceMappingURL=queue-metrics.service.js.map