"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppException = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../constants/error-codes");
class AppException extends common_1.HttpException {
    constructor(message, status = common_1.HttpStatus.BAD_REQUEST, options) {
        super({
            code: options?.code ?? (0, error_codes_1.mapHttpStatusToErrorCode)(status),
            message,
            details: options?.details,
        }, status);
    }
    static validationFailed(details) {
        return new AppException('Validation failed.', common_1.HttpStatus.BAD_REQUEST, {
            code: error_codes_1.ErrorCodes.validationFailed,
            details,
        });
    }
}
exports.AppException = AppException;
//# sourceMappingURL=app.exception.js.map