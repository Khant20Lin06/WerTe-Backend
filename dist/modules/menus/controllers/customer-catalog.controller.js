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
exports.CustomerCatalogController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const branch_catalog_dto_1 = require("../dto/branch-catalog.dto");
const customer_catalog_read_service_1 = require("../services/customer-catalog-read.service");
let CustomerCatalogController = class CustomerCatalogController {
    constructor(customerCatalogReadService) {
        this.customerCatalogReadService = customerCatalogReadService;
    }
    async getBranchMenu(branchId) {
        const branchCatalog = await this.customerCatalogReadService.getVisibleBranchCatalogOrThrow(branchId);
        return (0, branch_catalog_dto_1.toBranchCatalogDto)(branchCatalog);
    }
};
exports.CustomerCatalogController = CustomerCatalogController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getCustomerBranchMenuCatalog',
        summary: 'Return the visible menu catalog for a customer-facing branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns the active-only customer-visible menu catalog for the requested branch.',
        type: branch_catalog_dto_1.BranchCatalogDto,
    }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerCatalogController.prototype, "getBranchMenu", null);
exports.CustomerCatalogController = CustomerCatalogController = __decorate([
    (0, swagger_1.ApiTags)('customer-menu-catalog'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/branches/:branchId/menu'),
    __metadata("design:paramtypes", [customer_catalog_read_service_1.CustomerCatalogReadService])
], CustomerCatalogController);
//# sourceMappingURL=customer-catalog.controller.js.map