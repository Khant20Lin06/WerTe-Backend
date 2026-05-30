import { ConsoleLogger, Injectable } from '@nestjs/common';

import { redactSensitiveData } from './log-redaction.util';
import { RequestContextService } from './request-context.service';

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'verbose';

type LogMetadata = Record<string, unknown>;

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor(private readonly requestContext: RequestContextService) {
    super();
  }

  logEvent(message: string, metadata?: LogMetadata, context?: string) {
    super.log(this.serialize('log', message, metadata), context);
  }

  warnEvent(message: string, metadata?: LogMetadata, context?: string) {
    super.warn(this.serialize('warn', message, metadata), context);
  }

  debugEvent(message: string, metadata?: LogMetadata, context?: string) {
    super.debug(this.serialize('debug', message, metadata), context);
  }

  errorEvent(
    message: string,
    metadata?: LogMetadata,
    context?: string,
    trace?: string,
  ) {
    super.error(this.serialize('error', message, metadata), trace, context);
  }

  private serialize(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
  ): string {
    return JSON.stringify({
      level,
      message,
      requestId: this.requestContext.getRequestId() ?? 'system',
      timestamp: new Date().toISOString(),
      metadata: metadata == null ? undefined : redactSensitiveData(metadata),
    });
  }
}
