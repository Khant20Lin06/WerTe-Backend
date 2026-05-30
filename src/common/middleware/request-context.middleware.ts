import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { RequestContextService } from '../../infrastructure/logging/request-context.service';

type RequestWithContext = Request & {
  requestId?: string;
};

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(request: RequestWithContext, response: Response, next: NextFunction) {
    const requestId =
      request.header('x-request-id')?.trim() || randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    this.requestContext.run({ requestId }, () => next());
  }
}
