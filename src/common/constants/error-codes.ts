import { HttpStatus } from '@nestjs/common';

export const ErrorCodes = {
  badRequest: 'BAD_REQUEST',
  validationFailed: 'VALIDATION_FAILED',
  unauthorized: 'UNAUTHORIZED',
  invalidCredentials: 'INVALID_CREDENTIALS',
  invalidToken: 'INVALID_TOKEN',
  sessionRevoked: 'SESSION_REVOKED',
  sessionExpired: 'SESSION_EXPIRED',
  forbidden: 'FORBIDDEN',
  accountSuspended: 'ACCOUNT_SUSPENDED',
  accountPending: 'ACCOUNT_PENDING',
  notFound: 'NOT_FOUND',
  conflict: 'CONFLICT',
  unprocessableEntity: 'UNPROCESSABLE_ENTITY',
  timeout: 'REQUEST_TIMEOUT',
  tooManyRequests: 'TOO_MANY_REQUESTS',
  databaseUnavailable: 'DATABASE_UNAVAILABLE',
  databaseConstraintViolation: 'DATABASE_CONSTRAINT_VIOLATION',
  databaseRecordNotFound: 'DATABASE_RECORD_NOT_FOUND',
  databaseQueryInvalid: 'DATABASE_QUERY_INVALID',
  internalServerError: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCodes.badRequest;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCodes.unauthorized;
    case HttpStatus.FORBIDDEN:
      return ErrorCodes.forbidden;
    case HttpStatus.NOT_FOUND:
      return ErrorCodes.notFound;
    case HttpStatus.CONFLICT:
      return ErrorCodes.conflict;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ErrorCodes.unprocessableEntity;
    case HttpStatus.REQUEST_TIMEOUT:
      return ErrorCodes.timeout;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ErrorCodes.tooManyRequests;
    case HttpStatus.INTERNAL_SERVER_ERROR:
    default:
      return ErrorCodes.internalServerError;
  }
}
