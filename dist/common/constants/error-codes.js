"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
exports.mapHttpStatusToErrorCode = mapHttpStatusToErrorCode;
const common_1 = require("@nestjs/common");
exports.ErrorCodes = {
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
};
function mapHttpStatusToErrorCode(status) {
    switch (status) {
        case common_1.HttpStatus.BAD_REQUEST:
            return exports.ErrorCodes.badRequest;
        case common_1.HttpStatus.UNAUTHORIZED:
            return exports.ErrorCodes.unauthorized;
        case common_1.HttpStatus.FORBIDDEN:
            return exports.ErrorCodes.forbidden;
        case common_1.HttpStatus.NOT_FOUND:
            return exports.ErrorCodes.notFound;
        case common_1.HttpStatus.CONFLICT:
            return exports.ErrorCodes.conflict;
        case common_1.HttpStatus.UNPROCESSABLE_ENTITY:
            return exports.ErrorCodes.unprocessableEntity;
        case common_1.HttpStatus.REQUEST_TIMEOUT:
            return exports.ErrorCodes.timeout;
        case common_1.HttpStatus.TOO_MANY_REQUESTS:
            return exports.ErrorCodes.tooManyRequests;
        case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
        default:
            return exports.ErrorCodes.internalServerError;
    }
}
//# sourceMappingURL=error-codes.js.map