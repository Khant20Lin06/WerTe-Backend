import { HttpException, HttpStatus } from '@nestjs/common';

import {
  ErrorCode,
  ErrorCodes,
  mapHttpStatusToErrorCode,
} from '../constants/error-codes';

type AppExceptionOptions = {
  code?: ErrorCode;
  details?: unknown;
};

export class AppException extends HttpException {
  constructor(
    message: string,
    status = HttpStatus.BAD_REQUEST,
    options?: AppExceptionOptions,
  ) {
    super(
      {
        code: options?.code ?? mapHttpStatusToErrorCode(status),
        message,
        details: options?.details,
      },
      status,
    );
  }

  static validationFailed(details?: unknown) {
    return new AppException('Validation failed.', HttpStatus.BAD_REQUEST, {
      code: ErrorCodes.validationFailed,
      details,
    });
  }
}
