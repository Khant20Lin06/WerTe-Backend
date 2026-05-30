type HttpLikeRequest = {
  headers?: Record<string, string | string[] | undefined>;
  requestId?: string;
  id?: string;
};

function normalizeHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function buildResponseMeta(request?: HttpLikeRequest) {
  const requestId =
    request?.requestId ??
    request?.id ??
    normalizeHeaderValue(request?.headers?.['x-request-id']) ??
    'unknown';

  return {
    requestId,
    timestamp: new Date().toISOString(),
  };
}
