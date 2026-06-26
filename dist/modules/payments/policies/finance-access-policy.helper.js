"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCustomerFinanceScope = hasCustomerFinanceScope;
exports.requireCustomerFinanceScope = requireCustomerFinanceScope;
exports.hasAdminFinanceAccess = hasAdminFinanceAccess;
exports.requireAdminFinanceAccess = requireAdminFinanceAccess;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
function hasCustomerFinanceScope(currentUser) {
    return (currentUser.role === client_1.UserRole.CUSTOMER &&
        currentUser.actorContext.customerProfileId !== undefined);
}
function requireCustomerFinanceScope(currentUser) {
    const customerProfileId = currentUser.actorContext.customerProfileId;
    if (currentUser.role !== client_1.UserRole.CUSTOMER || customerProfileId === undefined) {
        throw new app_exception_1.AppException('The authenticated actor does not have a customer profile scope.', common_1.HttpStatus.FORBIDDEN, {
            code: error_codes_1.ErrorCodes.forbidden,
        });
    }
    return customerProfileId;
}
function hasAdminFinanceAccess(currentUser) {
    return currentUser.role === client_1.UserRole.ADMIN;
}
function requireAdminFinanceAccess(currentUser, resourceLabel) {
    if (!hasAdminFinanceAccess(currentUser)) {
        throw new app_exception_1.AppException(`Only admins can manage ${resourceLabel}.`, common_1.HttpStatus.FORBIDDEN, {
            code: error_codes_1.ErrorCodes.forbidden,
        });
    }
}
//# sourceMappingURL=finance-access-policy.helper.js.map