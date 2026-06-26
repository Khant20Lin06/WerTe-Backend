import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

import { getOrCreateCounter, getOrCreateHistogram } from './metrics.registry';

@Injectable()
export class QueueMetricsService {
  readonly jobDuration: Histogram = getOrCreateHistogram({
    name: 'queue_job_duration_seconds',
    help: 'BullMQ job processing duration in seconds',
    labelNames: ['queue', 'job_name'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30, 60],
  });

  readonly jobCompletedTotal: Counter = getOrCreateCounter({
    name: 'queue_jobs_completed_total',
    help: 'Total number of BullMQ jobs completed successfully',
    labelNames: ['queue', 'job_name'],
  });

  readonly jobFailedTotal: Counter = getOrCreateCounter({
    name: 'queue_jobs_failed_total',
    help: 'Total number of BullMQ jobs that failed',
    labelNames: ['queue', 'job_name'],
  });

  readonly jobRetriedTotal: Counter = getOrCreateCounter({
    name: 'queue_jobs_retried_total',
    help: 'Total number of BullMQ job retry attempts',
    labelNames: ['queue', 'job_name'],
  });

  readonly dlqJobsTotal: Counter = getOrCreateCounter({
    name: 'queue_dlq_jobs_total',
    help: 'Total number of jobs moved to the dead-letter queue after exhausting retries',
    labelNames: ['queue', 'job_name'],
  });
}
