import { Logger } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
type LogMetadata = Record<string, unknown>;
export declare class AppLogger extends Logger {
    private readonly requestContext;
    constructor(requestContext: RequestContextService);
    logEvent(message: string, metadata?: LogMetadata, context?: string): void;
    warnEvent(message: string, metadata?: LogMetadata, context?: string): void;
    debugEvent(message: string, metadata?: LogMetadata, context?: string): void;
    errorEvent(message: string, metadata?: LogMetadata, context?: string, trace?: string): void;
    private serialize;
}
export {};
