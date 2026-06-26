"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../constants/error-codes");
const app_logger_1 = require("../../infrastructure/logging/app.logger");
const response_meta_util_1 = require("../utils/response-meta.util");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const request = host.switchToHttp().getRequest();
        const meta = (0, response_meta_util_1.buildResponseMeta)(request);
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const prismaError = this.normalizePrismaKnownRequestError(exception);
            this.logNormalizedError(request, meta.requestId, prismaError.statusCode, prismaError.error);
            response.status(prismaError.statusCode).json({
                success: false,
                error: prismaError.error,
                meta,
            });
            return;
        }
        if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            const prismaValidationError = {
                code: error_codes_1.ErrorCodes.databaseQueryInvalid,
                message: 'Database query validation failed.',
            };
            this.logNormalizedError(request, meta.requestId, common_1.HttpStatus.BAD_REQUEST, prismaValidationError);
            response.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: prismaValidationError,
                meta,
            });
            return;
        }
        if (exception instanceof client_1.Prisma.PrismaClientInitializationError) {
            const initializationError = {
                code: error_codes_1.ErrorCodes.databaseUnavailable,
                message: 'Database connection is unavailable.',
            };
            this.logNormalizedError(request, meta.requestId, common_1.HttpStatus.SERVICE_UNAVAILABLE, initializationError);
            response.status(common_1.HttpStatus.SERVICE_UNAVAILABLE).json({
                success: false,
                error: initializationError,
                meta,
            });
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const normalizedError = this.normalizeHttpException(exception, status);
            this.logNormalizedError(request, meta.requestId, status, normalizedError);
            response.status(status).json({
                success: false,
                error: normalizedError,
                meta,
            });
            return;
        }
        this.logger?.errorEvent('Unhandled exception raised.', {
            method: request.method,
            path: request.originalUrl ?? request.url,
            requestId: meta.requestId,
        }, 'ExceptionFilter', exception instanceof Error ? exception.stack : undefined);
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                code: error_codes_1.ErrorCodes.internalServerError,
                message: 'Internal server error.',
            },
            meta,
        });
    }
    normalizePrismaKnownRequestError(exception) {
        switch (exception.code) {
            case 'P2002':
                return {
                    statusCode: common_1.HttpStatus.CONFLICT,
                    error: {
                        code: error_codes_1.ErrorCodes.databaseConstraintViolation,
                        message: 'A unique database constraint was violated.',
                    },
                };
            case 'P2003':
                return {
                    statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                    error: {
                        code: error_codes_1.ErrorCodes.databaseConstraintViolation,
                        message: 'A related database record is missing or invalid.',
                    },
                };
            case 'P2025':
                return {
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    error: {
                        code: error_codes_1.ErrorCodes.databaseRecordNotFound,
                        message: 'The requested database record was not found.',
                    },
                };
            default:
                return {
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    error: {
                        code: error_codes_1.ErrorCodes.internalServerError,
                        message: 'Database operation failed.',
                        details: {
                            prismaCode: exception.code,
                        },
                    },
                };
        }
    }
    normalizeHttpException(exception, status) {
        const response = exception.getResponse();
        if (typeof response === 'string') {
            return {
                code: (0, error_codes_1.mapHttpStatusToErrorCode)(status),
                message: response,
            };
        }
        if (typeof response === 'object' && response !== null) {
            const errorResponse = response;
            const message = Array.isArray(errorResponse.message)
                ? errorResponse.message.join(', ')
                : errorResponse.message ?? errorResponse.error ?? 'Request failed.';
            const details = errorResponse.details ??
                (Array.isArray(errorResponse.message)
                    ? { validationErrors: errorResponse.message }
                    : undefined);
            return {
                code: errorResponse.code ?? (0, error_codes_1.mapHttpStatusToErrorCode)(status),
                message,
                details,
            };
        }
        return {
            code: (0, error_codes_1.mapHttpStatusToErrorCode)(status),
            message: 'Request failed.',
        };
    }
    logNormalizedError(request, requestId, statusCode, error) {
        const payload = {
            method: request.method,
            path: request.originalUrl ?? request.url,
            requestId,
            statusCode,
            error,
        };
        if (statusCode >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger?.errorEvent('HTTP exception raised.', payload, 'ExceptionFilter');
            return;
        }
        this.logger?.warnEvent('HTTP exception raised.', payload, 'ExceptionFilter');
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [app_logger_1.AppLogger])
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map