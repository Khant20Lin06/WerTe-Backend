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
exports.CustomerAddressesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const address_dto_1 = require("../dto/address.dto");
const create_address_dto_1 = require("../dto/create-address.dto");
const delete_address_response_dto_1 = require("../dto/delete-address-response.dto");
const update_address_dto_1 = require("../dto/update-address.dto");
const customer_addresses_service_1 = require("../services/customer-addresses.service");
let CustomerAddressesController = class CustomerAddressesController {
    constructor(customerAddressesService) {
        this.customerAddressesService = customerAddressesService;
    }
    list(currentUser) {
        return this.customerAddressesService.listCurrentCustomerAddresses(currentUser);
    }
    create(currentUser, body) {
        return this.customerAddressesService.createCurrentCustomerAddress(currentUser, body);
    }
    update(currentUser, addressId, body) {
        return this.customerAddressesService.updateCurrentCustomerAddress(currentUser, addressId, body);
    }
    remove(currentUser, addressId) {
        return this.customerAddressesService.deleteCurrentCustomerAddress(currentUser, addressId);
    }
};
exports.CustomerAddressesController = CustomerAddressesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listCustomerAddresses',
        summary: 'List the authenticated customer addresses',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns addresses owned by the authenticated customer.',
        type: address_dto_1.AddressDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], CustomerAddressesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createCustomerAddress',
        summary: 'Create a new customer address',
    }),
    (0, swagger_1.ApiBody)({ type: create_address_dto_1.CreateAddressDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a customer-owned address.',
        type: address_dto_1.AddressDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        create_address_dto_1.CreateAddressDto]),
    __metadata("design:returntype", void 0)
], CustomerAddressesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateCustomerAddress',
        summary: 'Update a customer-owned address',
    }),
    (0, swagger_1.ApiBody)({ type: update_address_dto_1.UpdateAddressDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested customer address.',
        type: address_dto_1.AddressDto,
    }),
    (0, common_1.Patch)(':addressId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_address_dto_1.UpdateAddressDto]),
    __metadata("design:returntype", void 0)
], CustomerAddressesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'deleteCustomerAddress',
        summary: 'Delete a customer-owned address',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Deletes the requested address and promotes another address to default when needed.',
        type: delete_address_response_dto_1.DeleteAddressResponseDto,
    }),
    (0, common_1.Delete)(':addressId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('addressId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], CustomerAddressesController.prototype, "remove", null);
exports.CustomerAddressesController = CustomerAddressesController = __decorate([
    (0, swagger_1.ApiTags)('customer-addresses'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CUSTOMER),
    (0, common_1.Controller)('customer/addresses'),
    __metadata("design:paramtypes", [customer_addresses_service_1.CustomerAddressesService])
], CustomerAddressesController);
//# sourceMappingURL=customer-addresses.controller.js.map