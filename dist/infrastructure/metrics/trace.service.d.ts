import { Span } from '@opentelemetry/api';
export declare class TraceService {
    private readonly tracer;
    withSpan<T>(name: string, fn: (span: Span) => Promise<T>, attributes?: Record<string, string | number | boolean>): Promise<T>;
    setAttribute(key: string, value: string | number | boolean): void;
    recordException(error: Error): void;
    currentTraceId(): string;
}
