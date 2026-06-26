import { Injectable } from '@nestjs/common';
import { context, trace, Span, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class TraceService {
  private readonly tracer = trace.getTracer('food-delivery-backend');

  /**
   * Run `fn` inside a new child span. The span is ended automatically when
   * the promise resolves or rejects. On rejection the span is marked as error.
   *
   * Usage:
   *   return this.tracing.withSpan('OrderService.create', async (span) => {
   *     span.setAttribute('order.id', order.id);
   *     return this.repo.save(order);
   *   });
   */
  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: Record<string, string | number | boolean>,
  ): Promise<T> {
    return this.tracer.startActiveSpan(name, async (span) => {
      if (attributes) {
        span.setAttributes(attributes);
      }
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /** Add an attribute to the currently-active span (if any). No-op otherwise. */
  setAttribute(key: string, value: string | number | boolean): void {
    trace.getActiveSpan()?.setAttribute(key, value);
  }

  /** Record an exception on the currently-active span. No-op if no active span. */
  recordException(error: Error): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    }
  }

  /** Return the current trace-id (hex string) for log correlation. Empty string when no active span. */
  currentTraceId(): string {
    return trace.getActiveSpan()?.spanContext().traceId ?? '';
  }
}
