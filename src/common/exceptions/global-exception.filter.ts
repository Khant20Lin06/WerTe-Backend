import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  ErrorCodes,
  mapHttpStatusToErrorCode,
} from '../constants/error-codes';
import { AppLogger } from '../../infrastructure/logging/app.logger';
import { buildResponseMeta } from '../utils/response-meta.util';

type NormalizedError = {
  code: string;
  message: string;
  details?: unknown;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger?: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const meta = buildResponseMeta(request);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.normalizePrismaKnownRequestError(exception);
      this.logNormalizedError(
        request,
        meta.requestId,
        prismaError.statusCode,
        prismaError.error,
      );

      response.status(prismaError.statusCode).json({
        success: false,
        error: prismaError.error,
        meta,
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      const prismaValidationError = {
        code: ErrorCodes.databaseQueryInvalid,
        message: 'Database query validation failed.',
      };
      this.logNormalizedError(
        request,
        meta.requestId,
        HttpStatus.BAD_REQUEST,
        prismaValidationError,
      );
      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: prismaValidationError,
        meta,
      });
      return;
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      const initializationError = {
        code: ErrorCodes.databaseUnavailable,
        message: 'Database connection is unavailable.',
      };
      this.logNormalizedError(
        request,
        meta.requestId,
        HttpStatus.SERVICE_UNAVAILABLE,
        initializationError,
      );
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        error: initializationError,
        meta,
      });
      return;
    }

    if (exception instanceof HttpException) {
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

    this.logger?.errorEvent(
      'Unhandled exception raised.',
      {
        method: request.method,
        path: request.originalUrl ?? request.url,
        requestId: meta.requestId,
      },
      'ExceptionFilter',
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.internalServerError,
        message: 'Internal server error.',
      },
      meta,
    });
  }

  private normalizePrismaKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): {
    error: NormalizedError;
    statusCode: number;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          error: {
            code: ErrorCodes.databaseConstraintViolation,
            message: 'A unique database constraint was violated.',
            details: {
              prismaCode: exception.code,
              target: exception.meta?.target,
            },
          },
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          error: {
            code: ErrorCodes.databaseConstraintViolation,
            message: 'A related database record is missing or invalid.',
            details: {
              prismaCode: exception.code,
              fieldName: exception.meta?.field_name,
            },
          },
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          error: {
            code: ErrorCodes.databaseRecordNotFound,
            message: 'The requested database record was not found.',
            details: {
              prismaCode: exception.code,
              cause: exception.meta?.cause,
            },
          },
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: {
            code: ErrorCodes.internalServerError,
            message: 'Database operation failed.',
            details: {
              prismaCode: exception.code,
            },
          },
        };
    }
  }

  private normalizeHttpException(
    exception: HttpException,
    status: number,
  ): NormalizedError {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        code: mapHttpStatusToErrorCode(status),
        message: response,
      };
    }

    if (typeof response === 'object' && response !== null) {
      const errorResponse = response as {
        code?: string;
        message?: string | string[];
        details?: unknown;
        error?: string;
      };

      const message = Array.isArray(errorResponse.message)
        ? errorResponse.message.join(', ')
        : errorResponse.message ?? errorResponse.error ?? 'Request failed.';

      const details =
        errorResponse.details ??
        (Array.isArray(errorResponse.message)
          ? { validationErrors: errorResponse.message }
          : undefined);

      return {
        code: errorResponse.code ?? mapHttpStatusToErrorCode(status),
        message,
        details,
      };
    }

    return {
      code: mapHttpStatusToErrorCode(status),
      message: 'Request failed.',
    };
  }

  private logNormalizedError(
    request: {
      method?: string;
      originalUrl?: string;
      url?: string;
    },
    requestId: string,
    statusCode: number,
    error: NormalizedError,
  ) {
    const payload = {
      method: request.method,
      path: request.originalUrl ?? request.url,
      requestId,
      statusCode,
      error,
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger?.errorEvent('HTTP exception raised.', payload, 'ExceptionFilter');
      return;
    }

    this.logger?.warnEvent('HTTP exception raised.', payload, 'ExceptionFilter');
  }
}
