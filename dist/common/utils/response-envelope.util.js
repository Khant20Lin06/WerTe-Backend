"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResponseEnvelope = isResponseEnvelope;
function isResponseEnvelope(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'success' in value &&
        'meta' in value);
}
//# sourceMappingURL=response-envelope.util.js.map