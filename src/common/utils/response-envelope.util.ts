export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
};

export function isResponseEnvelope(
  value: unknown,
): value is SuccessResponse<unknown> | ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'meta' in value
  );
}
