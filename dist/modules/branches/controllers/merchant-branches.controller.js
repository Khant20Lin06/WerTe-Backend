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
exports.MerchantBranchesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const branch_dto_1 = require("../dto/branch.dto");
const create_branch_dto_1 = require("../dto/create-branch.dto");
const update_branch_dto_1 = require("../dto/update-branch.dto");
const merchant_branches_service_1 = require("../services/merchant-branches.service");
let MerchantBranchesController = class MerchantBranchesController {
    constructor(merchantBranchesService) {
        this.merchantBranchesService = merchantBranchesService;
    }
    list(currentUser) {
        return this.merchantBranchesService.listCurrentMerchantBranches(currentUser);
    }
    get(currentUser, branchId) {
        return this.merchantBranchesService.getCurrentMerchantBranch(currentUser, branchId);
    }
    create(currentUser, body) {
        return this.merchantBranchesService.createCurrentMerchantBranch(currentUser, body);
    }
    update(currentUser, branchId, body) {
        return this.merchantBranchesService.updateCurrentMerchantBranch(currentUser, branchId, body);
    }
};
exports.MerchantBranchesController = MerchantBranchesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantBranches',
        summary: 'List branches owned by the authenticated merchant',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns branches owned by the authenticated merchant.',
        type: branch_dto_1.BranchDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity]),
    __metadata("design:returntype", void 0)
], MerchantBranchesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantBranch',
        summary: 'Return a branch owned by the authenticated merchant',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns a single branch owned by the authenticated merchant.',
        type: branch_dto_1.BranchDto,
    }),
    (0, common_1.Get)(':branchId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantBranchesController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantBranch',
        summary: 'Create a new branch for the authenticated merchant',
    }),
    (0, swagger_1.ApiBody)({ type: create_branch_dto_1.CreateBranchDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a new branch owned by the merchant.',
        type: branch_dto_1.BranchDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity,
        create_branch_dto_1.CreateBranchDto]),
    __metadata("design:returntype", void 0)
], MerchantBranchesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantBranch',
        summary: 'Update a branch owned by the authenticated merchant',
    }),
    (0, swagger_1.ApiBody)({ type: update_branch_dto_1.UpdateBranchDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested merchant-owned branch.',
        type: branch_dto_1.BranchDto,
    }),
    (0, common_1.Patch)(':branchId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, update_branch_dto_1.UpdateBranchDto]),
    __metadata("design:returntype", void 0)
], MerchantBranchesController.prototype, "update", null);
exports.MerchantBranchesController = MerchantBranchesController = __decorate([
    (0, swagger_1.ApiTags)('merchant-branches'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches'),
    __metadata("design:paramtypes", [merchant_branches_service_1.MerchantBranchesService])
], MerchantBranchesController);
//# sourceMappingURL=merchant-branches.controller.js.map