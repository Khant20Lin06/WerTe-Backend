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
exports.AdminStoreTypesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_store_type_dto_1 = require("../dto/create-store-type.dto");
const store_type_dto_1 = require("../dto/store-type.dto");
const update_store_type_dto_1 = require("../dto/update-store-type.dto");
const store_type_management_service_1 = require("../services/store-type-management.service");
let AdminStoreTypesController = class AdminStoreTypesController {
    constructor(storeTypeManagementService) {
        this.storeTypeManagementService = storeTypeManagementService;
    }
    list(currentUser) {
        return this.storeTypeManagementService.listStoreTypes(currentUser);
    }
    get(currentUser, storeTypeId) {
        return this.storeTypeManagementService.getStoreType(currentUser, storeTypeId);
    }
    create(currentUser, body) {
        return this.storeTypeManagementService.createStoreType(currentUser, body);
    }
    update(currentUser, storeTypeId, body) {
        return this.storeTypeManagementService.updateStoreType(currentUser, storeTypeId, body);
    }
    archive(currentUser, storeTypeId) {
        return this.storeTypeManagementService.archiveStoreType(currentUser, storeTypeId);
    }
    activate(currentUser, storeTypeId) {
        return this.storeTypeManagementService.activateStoreType(currentUser, storeTypeId);
    }
};
exports.AdminStoreTypesController = AdminStoreTypesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminStoreTypes',
        summary: 'List store types for the administrative control plane',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns all store types with usage counters.',
        type: store_type_dto_1.StoreTypeDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], AdminStoreTypesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getAdminStoreType',
        summary: 'Return one administrative store type record',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_restaurant',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a single store type with usage counters.',
        type: store_type_dto_1.StoreTypeDto,
    }),
    (0, common_1.Get)(':storeTypeId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AdminStoreTypesController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createAdminStoreType',
        summary: 'Create a new dynamic store type',
    }),
    (0, swagger_1.ApiBody)({ type: create_store_type_dto_1.CreateStoreTypeDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a new store type.',
        type: store_type_dto_1.StoreTypeDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        create_store_type_dto_1.CreateStoreTypeDto]),
    __metadata("design:returntype", void 0)
], AdminStoreTypesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateAdminStoreType',
        summary: 'Update an existing dynamic store type',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_restaurant',
    }),
    (0, swagger_1.ApiBody)({ type: update_store_type_dto_1.UpdateStoreTypeDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested store type.',
        type: store_type_dto_1.StoreTypeDto,
    }),
    (0, common_1.Patch)(':storeTypeId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeTypeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_store_type_dto_1.UpdateStoreTypeDto]),
    __metadata("design:returntype", void 0)
], AdminStoreTypesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'archiveAdminStoreType',
        summary: 'Archive a dynamic store type',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_restaurant',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Archives the store type and returns the updated snapshot.',
        type: store_type_dto_1.StoreTypeDto,
    }),
    (0, common_1.Post)(':storeTypeId/archive'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AdminStoreTypesController.prototype, "archive", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'activateAdminStoreType',
        summary: 'Re-activate a dynamic store type',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_restaurant',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Re-activates the store type and returns the updated snapshot.',
        type: store_type_dto_1.StoreTypeDto,
    }),
    (0, common_1.Post)(':storeTypeId/activate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AdminStoreTypesController.prototype, "activate", null);
exports.AdminStoreTypesController = AdminStoreTypesController = __decorate([
    (0, swagger_1.ApiTags)('admin-store-types'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin/store-types'),
    __metadata("design:paramtypes", [store_type_management_service_1.StoreTypeManagementService])
], AdminStoreTypesController);
//# sourceMappingURL=admin-store-types.controller.js.map