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
exports.AdminBranchStoreTypesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const admin_branch_store_type_action_dto_1 = require("../dto/admin-branch-store-type-action.dto");
const branch_store_type_dto_1 = require("../dto/branch-store-type.dto");
const list_admin_branch_store_types_query_dto_1 = require("../dto/list-admin-branch-store-types-query.dto");
const manage_branch_store_type_dto_1 = require("../dto/manage-branch-store-type.dto");
const store_type_management_service_1 = require("../services/store-type-management.service");
let AdminBranchStoreTypesController = class AdminBranchStoreTypesController {
    constructor(storeTypeManagementService) {
        this.storeTypeManagementService = storeTypeManagementService;
    }
    list(currentUser, query) {
        return this.storeTypeManagementService.listBranchStoreTypes(currentUser, query);
    }
    listByBranch(currentUser, branchId) {
        return this.storeTypeManagementService.listBranchStoreTypesByBranch(currentUser, branchId);
    }
    assign(currentUser, branchId, body) {
        return this.storeTypeManagementService.assignBranchStoreType(currentUser, branchId, body);
    }
    approve(currentUser, branchId, storeTypeId, body) {
        return this.storeTypeManagementService.approveBranchStoreType(currentUser, branchId, storeTypeId, body ?? {});
    }
    reject(currentUser, branchId, storeTypeId, body) {
        return this.storeTypeManagementService.rejectBranchStoreType(currentUser, branchId, storeTypeId, body ?? {});
    }
    hide(currentUser, branchId, storeTypeId, body) {
        return this.storeTypeManagementService.hideBranchStoreType(currentUser, branchId, storeTypeId, body ?? {});
    }
    unhide(currentUser, branchId, storeTypeId, body) {
        return this.storeTypeManagementService.unhideBranchStoreType(currentUser, branchId, storeTypeId, body ?? {});
    }
};
exports.AdminBranchStoreTypesController = AdminBranchStoreTypesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminBranchStoreTypes',
        summary: 'List branch store type assignments visible to the admin control plane',
    }),
    (0, swagger_1.ApiQuery)({ name: 'branchId', required: false, example: 'branch_1' }),
    (0, swagger_1.ApiQuery)({
        name: 'storeTypeId',
        required: false,
        example: 'store_type_restaurant',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, example: 'PENDING' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns branch store type assignments filtered for the control plane.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
        isArray: true,
    }),
    (0, common_1.Get)('branch-store-types'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        list_admin_branch_store_types_query_dto_1.ListAdminBranchStoreTypesQueryDto]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listAdminBranchStoreTypesByBranch',
        summary: 'List all store type assignments for a branch',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier visible to the administrative control plane.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns branch store type assignments for the requested branch.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
        isArray: true,
    }),
    (0, common_1.Get)('branches/:branchId/store-types'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "listByBranch", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'assignAdminBranchStoreType',
        summary: 'Assign a store type to a branch from the admin control plane',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier visible to the administrative control plane.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiBody)({ type: manage_branch_store_type_dto_1.ManageBranchStoreTypeDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates or updates the branch store type assignment.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
    }),
    (0, common_1.Post)('branches/:branchId/store-types'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, manage_branch_store_type_dto_1.ManageBranchStoreTypeDto]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "assign", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'approveAdminBranchStoreType',
        summary: 'Approve a branch store type assignment',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier visible to the administrative control plane.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_grocery',
    }),
    (0, swagger_1.ApiBody)({ type: admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Approves the assignment and returns the updated snapshot.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
    }),
    (0, common_1.Post)('branches/:branchId/store-types/:storeTypeId/approve'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('storeTypeId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "approve", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'rejectAdminBranchStoreType',
        summary: 'Reject a branch store type assignment',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier visible to the administrative control plane.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_grocery',
    }),
    (0, swagger_1.ApiBody)({ type: admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Rejects the assignment and returns the updated snapshot.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
    }),
    (0, common_1.Post)('branches/:branchId/store-types/:storeTypeId/reject'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('storeTypeId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "reject", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'hideAdminBranchStoreType',
        summary: 'Hide a branch store type assignment',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier visible to the administrative control plane.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_grocery',
    }),
    (0, swagger_1.ApiBody)({ type: admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Hides the assignment and returns the updated snapshot.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
    }),
    (0, common_1.Post)('branches/:branchId/store-types/:storeTypeId/hide'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('storeTypeId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "hide", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'unhideAdminBranchStoreType',
        summary: 'Unhide and re-approve a branch store type assignment',
    }),
    (0, swagger_1.ApiParam)({
        name: 'branchId',
        description: 'Branch identifier visible to the administrative control plane.',
        example: 'branch_1',
    }),
    (0, swagger_1.ApiParam)({
        name: 'storeTypeId',
        description: 'Store type identifier visible to the administrative control plane.',
        example: 'store_type_grocery',
    }),
    (0, swagger_1.ApiBody)({ type: admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto, required: false }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Unhides the assignment and returns the updated snapshot.',
        type: branch_store_type_dto_1.BranchStoreTypeDto,
    }),
    (0, common_1.Post)('branches/:branchId/store-types/:storeTypeId/unhide'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('storeTypeId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, admin_branch_store_type_action_dto_1.AdminBranchStoreTypeActionDto]),
    __metadata("design:returntype", void 0)
], AdminBranchStoreTypesController.prototype, "unhide", null);
exports.AdminBranchStoreTypesController = AdminBranchStoreTypesController = __decorate([
    (0, swagger_1.ApiTags)('admin-store-types'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [store_type_management_service_1.StoreTypeManagementService])
], AdminBranchStoreTypesController);
//# sourceMappingURL=admin-branch-store-types.controller.js.map