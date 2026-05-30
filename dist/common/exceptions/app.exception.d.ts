import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';
type AppExceptionOptions = {
    code?: ErrorCode;
    details?: unknown;
};
export declare class AppException extends HttpException {
    constructor(message: string, status?: HttpStatus, options?: AppExceptionOptions);
    static validationFailed(details?: unknown): AppException;
}
export {};
