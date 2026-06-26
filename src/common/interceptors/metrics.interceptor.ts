import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, finalize } from 'rxjs';

import { HttpMetricsService } from '../../infrastructure/metrics/http-metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly httpMetrics: HttpMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const endTimer = this.httpMetrics.requestDuration.startTimer();

    return next.handle().pipe(
      finalize(() => {
        const route = (request.route?.path as string | undefined) ?? request.url ?? 'unknown';
        const labels = {
          method: request.method as string,
          route,
          status_code: String(response.statusCode),
        };

        endTimer(labels);
        this.httpMetrics.requestTotal.inc(labels);

        if (response.statusCode >= 400) {
          this.httpMetrics.requestErrorsTotal.inc(labels);
        }
      }),
    );
  }
}
