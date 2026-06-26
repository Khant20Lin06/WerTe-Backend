"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResponseMeta = buildResponseMeta;
function normalizeHeaderValue(value) {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
}
function buildResponseMeta(request) {
    const requestId = request?.requestId ??
        request?.id ??
        normalizeHeaderValue(request?.headers?.['x-request-id']) ??
        'unknown';
    return {
        requestId,
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=response-meta.util.js.map