import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { buildResponseMeta } from '../utils/response-meta.util';
import { isResponseEnvelope } from '../utils/response-envelope.util';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        if (isResponseEnvelope(data)) {
          return data;
        }

        return {
          success: true,
          data,
          meta: buildResponseMeta(request),
        };
      }),
    );
  }
}
