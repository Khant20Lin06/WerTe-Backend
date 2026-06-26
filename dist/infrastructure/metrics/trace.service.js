"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("@opentelemetry/api");
let TraceService = class TraceService {
    constructor() {
        this.tracer = api_1.trace.getTracer('food-delivery-backend');
    }
    async withSpan(name, fn, attributes) {
        return this.tracer.startActiveSpan(name, async (span) => {
            if (attributes) {
                span.setAttributes(attributes);
            }
            try {
                const result = await fn(span);
                span.setStatus({ code: api_1.SpanStatusCode.OK });
                return result;
            }
            catch (error) {
                span.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: error instanceof Error ? error.message : String(error),
                });
                span.recordException(error);
                throw error;
            }
            finally {
                span.end();
            }
        });
    }
    setAttribute(key, value) {
        api_1.trace.getActiveSpan()?.setAttribute(key, value);
    }
    recordException(error) {
        const span = api_1.trace.getActiveSpan();
        if (span) {
            span.recordException(error);
            span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error.message });
        }
    }
    currentTraceId() {
        return api_1.trace.getActiveSpan()?.spanContext().traceId ?? '';
    }
};
exports.TraceService = TraceService;
exports.TraceService = TraceService = __decorate([
    (0, common_1.Injectable)()
], TraceService);
//# sourceMappingURL=trace.service.js.map