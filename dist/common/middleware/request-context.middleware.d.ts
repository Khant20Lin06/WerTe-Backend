import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestContextService } from '../../infrastructure/logging/request-context.service';
type RequestWithContext = Request & {
    requestId?: string;
};
export declare class RequestContextMiddleware implements NestMiddleware {
    private readonly requestContext;
    constructor(requestContext: RequestContextService);
    use(request: RequestWithContext, response: Response, next: NextFunction): void;
}
export {};
