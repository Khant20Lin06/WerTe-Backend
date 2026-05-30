"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSensitiveData = redactSensitiveData;
const SENSITIVE_KEYS = new Set([
    'password',
    'passwordhash',
    'token',
    'accesstoken',
    'refreshtoken',
    'authorization',
    'cookie',
    'secret',
    'apikey',
    'apiKey',
]);
function shouldRedact(key) {
    return SENSITIVE_KEYS.has(key.toLowerCase());
}
function redactSensitiveData(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redactSensitiveData(item));
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [
            key,
            shouldRedact(key) ? '[REDACTED]' : redactSensitiveData(nestedValue),
        ]));
    }
    return value;
}
//# sourceMappingURL=log-redaction.util.js.map