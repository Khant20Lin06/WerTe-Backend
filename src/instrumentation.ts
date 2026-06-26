/**
 * OpenTelemetry SDK initialisation.
 *
 * This file MUST be loaded before any other module via Node's --require flag
 * (see start:prod script and CI workflow). Loading it after NestJS or Express
 * initialises means the auto-instrumentation monkey-patches arrive too late to
 * wrap http.Server, pg.Client, ioredis, etc.
 *
 * Environment variables (all optional — tracing is a no-op when OTEL_EXPORTER_OTLP_ENDPOINT is unset):
 *   OTEL_SERVICE_NAME             default: food-delivery-backend
 *   OTEL_SERVICE_VERSION          default: unknown
 *   OTEL_ENVIRONMENT              default: NODE_ENV
 *   OTEL_EXPORTER_OTLP_ENDPOINT   e.g. http://jaeger:4318  (HTTP/proto)
 *   OTEL_TRACES_SAMPLER           parentbased_always_on | always_off | traceidratio
 *   OTEL_TRACES_SAMPLER_ARG       ratio for traceidratio (0.0–1.0)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  ParentBasedSampler,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';

const serviceName =
  process.env.OTEL_SERVICE_NAME ?? process.env.APP_NAME ?? 'food-delivery-backend';
const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? 'unknown';
const environment = process.env.OTEL_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? '';
const isDev = environment === 'development';

function buildSampler() {
  const samplerType = process.env.OTEL_TRACES_SAMPLER ?? 'parentbased_always_on';
  if (samplerType === 'traceidratio') {
    const ratio = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG ?? '1.0');
    return new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(ratio) });
  }
  return undefined;
}

const spanProcessors = [];

if (otlpEndpoint) {
  const exporter = new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` });
  spanProcessors.push(new BatchSpanProcessor(exporter));
}

// In development with no OTLP endpoint, log spans to stdout so developers can
// see trace data without running a collector.
if (isDev && !otlpEndpoint) {
  spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

const sampler = buildSampler();

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    'deployment.environment': environment,
  }),
  ...(sampler !== undefined ? { sampler } : {}),
  spanProcessors,
  instrumentations: [
    getNodeAutoInstrumentations({
      // HTTP instrumentation captures all inbound NestJS requests and
      // outbound fetch/axios calls automatically.
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        // Don't create spans for health/metrics polling — they pollute traces.
        ignoreIncomingRequestHook: (req) => {
          const url = req.url ?? '';
          return (
            url.includes('/health/live') ||
            url.includes('/health/ready') ||
            url.includes('/metrics')
          );
        },
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-ioredis': {
        enabled: true,
        dbStatementSerializer: (cmdName: string) => cmdName,
      },
      // Suppress noisy low-level instrumentations irrelevant to this service.
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().catch(() => {});
});
