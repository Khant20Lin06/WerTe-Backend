import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { finalize, Observable } from 'rxjs';

import { AppLogger } from '../../infrastructure/logging/app.logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startedAt = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const duration = Date.now() - startedAt;
        const actorId =
          request.user?.sub ??
          request.user?.id ??
          request.user?.userId ??
          'anonymous';

        this.logger.logEvent(
          'HTTP request completed.',
          {
            actorId,
            durationMs: duration,
            method: request.method,
            path: request.originalUrl ?? request.url,
            requestId: request.requestId,
            statusCode: response.statusCode,
          },
          'HTTP',
        );
      }),
    );
  }
}
