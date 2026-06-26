import { Counter, Histogram } from 'prom-client';
export declare class QueueMetricsService {
    readonly jobDuration: Histogram;
    readonly jobCompletedTotal: Counter;
    readonly jobFailedTotal: Counter;
    readonly jobRetriedTotal: Counter;
    readonly dlqJobsTotal: Counter;
}
