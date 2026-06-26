"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const serviceName = process.env.OTEL_SERVICE_NAME ?? process.env.APP_NAME ?? 'food-delivery-backend';
const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? 'unknown';
const environment = process.env.OTEL_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? '';
const isDev = environment === 'development';
function buildSampler() {
    const samplerType = process.env.OTEL_TRACES_SAMPLER ?? 'parentbased_always_on';
    if (samplerType === 'traceidratio') {
        const ratio = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG ?? '1.0');
        return new sdk_trace_node_1.ParentBasedSampler({ root: new sdk_trace_node_1.TraceIdRatioBasedSampler(ratio) });
    }
    return undefined;
}
const spanProcessors = [];
if (otlpEndpoint) {
    const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` });
    spanProcessors.push(new sdk_trace_node_1.BatchSpanProcessor(exporter));
}
if (isDev && !otlpEndpoint) {
    spanProcessors.push(new sdk_trace_node_1.SimpleSpanProcessor(new sdk_trace_node_1.ConsoleSpanExporter()));
}
const sampler = buildSampler();
const sdk = new sdk_node_1.NodeSDK({
    resource: (0, resources_1.resourceFromAttributes)({
        [semantic_conventions_1.ATTR_SERVICE_NAME]: serviceName,
        [semantic_conventions_1.ATTR_SERVICE_VERSION]: serviceVersion,
        'deployment.environment': environment,
    }),
    ...(sampler !== undefined ? { sampler } : {}),
    spanProcessors,
    instrumentations: [
        (0, auto_instrumentations_node_1.getNodeAutoInstrumentations)({
            '@opentelemetry/instrumentation-http': {
                enabled: true,
                ignoreIncomingRequestHook: (req) => {
                    const url = req.url ?? '';
                    return (url.includes('/health/live') ||
                        url.includes('/health/ready') ||
                        url.includes('/metrics'));
                },
            },
            '@opentelemetry/instrumentation-express': { enabled: true },
            '@opentelemetry/instrumentation-pg': { enabled: true },
            '@opentelemetry/instrumentation-ioredis': {
                enabled: true,
                dbStatementSerializer: (cmdName) => cmdName,
            },
            '@opentelemetry/instrumentation-fs': { enabled: false },
            '@opentelemetry/instrumentation-dns': { enabled: false },
            '@opentelemetry/instrumentation-net': { enabled: false },
        }),
    ],
});
sdk.start();
process.on('SIGTERM', () => {
    sdk.shutdown().catch(() => { });
});
//# sourceMappingURL=instrumentation.js.map