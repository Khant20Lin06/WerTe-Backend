import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpMetricsService } from '../../infrastructure/metrics/http-metrics.service';
export declare class MetricsInterceptor implements NestInterceptor {
    private readonly httpMetrics;
    constructor(httpMetrics: HttpMetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
