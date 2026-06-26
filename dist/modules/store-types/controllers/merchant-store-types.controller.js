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
exports.MerchantStoreTypesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const available_store_type_dto_1 = require("../dto/available-store-type.dto");
const branch_store_type_dto_1 = require("../dto/branch-store-type.dto");
const request_branch_store_type_dto_1 = require("../dto/request-branch-store-type.dto");
const merchant_store_type_request_service_1 = require("../services/merchant-store-type-request.service");
let MerchantStoreTypesController = class MerchantStoreTypesController {
    constructor(merchantStoreTypeRequestService) {
        this.merchantStoreTypeRequestService = merchantStoreTypeRequestService;
    }
    listAvailable(currentUser) {
        return this.merchantStoreTypeRequestService.listAvailableStoreTypes(currentUser);
    }
    listBranchAssignments(currentUser, branchId) {
        return this.merchantStoreTypeRequestService.listCurrentMerchantBranchStoreTypes(currentUser, branchId);
    }
    request(currentUser, branchId, body) {
        return this.merchantStoreTypeRequestService.requestCurrentMerchantBranchStoreType(currentUser, branchId, body);
    }
};
exports.MerchantStoreTypesController = MerchantStoreTypesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantAvailableStoreTypes',
        summary: 'List active store types available for merchant requests',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns active store types available to the authenticated merchant.',
        type: available_store_type_dto_1.AvailableStoreTypeDto,
        isArray: true,
    }),
    (0, common_1.Get)('store-types'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], MerchantStoreTypesController.prototype, "listAvailable", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantBranchStoreTypeRequests',
        summary: 'List store type assignments and requests for a merchant-owned branch',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier owned by the authenticated merchant.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns branch store type assignments and their current approval statuses.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
        isArray: true,
    }),
    (0, common_1.Get)('branches/:branchId/store-types'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantStoreTypesController.prototype, "listBranchAssignments", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'requestMerchantBranchStoreType',
        summary: 'Request a new store type assignment for a merchant-owned branch',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier owned by the authenticated merchant.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiBody)({ type: request_branch_store_type_dto_1.RequestBranchStoreTypeDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates or re-submits a pending store type request for the branch.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
    }),
    (0, common_1.Post)('branches/:branchId/store-types'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, request_branch_store_type_dto_1.RequestBranchStoreTypeDto]),
    __metadata("design:returntype", void 0)
], MerchantStoreTypesController.prototype, "request", null);
exports.MerchantStoreTypesController = MerchantStoreTypesController = __decorate([
    (0, swagger_1.ApiTags)('merchant-store-types'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant'),
    __metadata("design:paramtypes", [merchant_store_type_request_service_1.MerchantStoreTypeRequestService])
], MerchantStoreTypesController);
//# sourceMappingURL=merchant-store-types.controller.js.map