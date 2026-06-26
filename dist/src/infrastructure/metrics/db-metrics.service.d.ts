import { Counter, Histogram } from 'prom-client';
export declare class DbMetricsService {
    readonly queryDuration: Histogram;
    readonly queryErrorsTotal: Counter;
}
