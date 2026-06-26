import { Counter, Histogram } from 'prom-client';
export declare class HttpMetricsService {
    readonly requestDuration: Histogram;
    readonly requestTotal: Counter;
    readonly requestErrorsTotal: Counter;
}
