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

function shouldRedact(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function redactSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item));
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        shouldRedact(key) ? '[REDACTED]' : redactSensitiveData(nestedValue),
      ]),
    );
  }

  return value;
}
