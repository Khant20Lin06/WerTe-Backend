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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCustomersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const admin_customer_list_dto_1 = require("../dto/admin-customer-list.dto");
const customer_profile_dto_1 = require("../dto/customer-profile.dto");
const admin_customer_management_service_1 = require("../services/admin-customer-management.service");
class AdminUpdateCustomerStatusDto {
}
let AdminCustomersController = class AdminCustomersController {
    constructor(adminCustomerManagementService) {
        this.adminCustomerManagementService = adminCustomerManagementService;
    }
    listCustomers(query) {
        return this.adminCustomerManagementService.listCustomers({
            status: query.status,
            search: query.search,
        });
    }
    updateCustomerStatus(customerId, body) {
        return this.adminCustomerManagementService.updateCustomerStatus(customerId, body.status);
    }
};
exports.AdminCustomersController = AdminCustomersController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminListCustomers',
        summary: 'List all customers with optional status / search filter',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns list of customer profiles.',
        type: [customer_profile_dto_1.CustomerProfileDto],
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_customer_list_dto_1.AdminCustomerListQueryDto]),
    __metadata("design:returntype", void 0)
], AdminCustomersController.prototype, "listCustomers", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adminUpdateCustomerStatus',
        summary: 'Suspend or reactivate a customer account',
    }),
    (0, swagger_1.ApiParam)({ name: 'customerId', description: 'Customer profile identifier' }),
    (0, swagger_1.ApiBody)({ type: AdminUpdateCustomerStatusDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the updated customer profile.',
        type: customer_profile_dto_1.CustomerProfileDto,
    }),
    (0, common_1.Patch)(':customerId/status'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AdminUpdateCustomerStatusDto]),
    __metadata("design:returntype", void 0)
], AdminCustomersController.prototype, "updateCustomerStatus", null);
exports.AdminCustomersController = AdminCustomersController = __decorate([
    (0, swagger_1.ApiTags)('admin-customers'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/customers'),
    __metadata("design:paramtypes", [admin_customer_management_service_1.AdminCustomerManagementService])
], AdminCustomersController);
//# sourceMappingURL=admin-customers.controller.js.map