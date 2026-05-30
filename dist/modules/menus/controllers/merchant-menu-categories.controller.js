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
exports.MerchantMenuCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_menu_category_dto_1 = require("../dto/create-menu-category.dto");
const menu_category_dto_1 = require("../dto/menu-category.dto");
const update_menu_category_dto_1 = require("../dto/update-menu-category.dto");
const merchant_menu_categories_service_1 = require("../services/merchant-menu-categories.service");
let MerchantMenuCategoriesController = class MerchantMenuCategoriesController {
    constructor(merchantMenuCategoriesService) {
        this.merchantMenuCategoriesService = merchantMenuCategoriesService;
    }
    list(currentUser, branchId) {
        return this.merchantMenuCategoriesService.listBranchCategories(currentUser, branchId);
    }
    get(currentUser, branchId, categoryId) {
        return this.merchantMenuCategoriesService.getBranchCategory(currentUser, branchId, categoryId);
    }
    create(currentUser, branchId, body) {
        return this.merchantMenuCategoriesService.createBranchCategory(currentUser, branchId, body);
    }
    update(currentUser, branchId, categoryId, body) {
        return this.merchantMenuCategoriesService.updateBranchCategory(currentUser, branchId, categoryId, body);
    }
};
exports.MerchantMenuCategoriesController = MerchantMenuCategoriesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantMenuCategories',
        summary: 'List categories for a merchant-owned branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns menu categories owned by the requested merchant branch.',
        type: menu_category_dto_1.MenuCategoryDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuCategoriesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantMenuCategory',
        summary: 'Return one menu category for a merchant-owned branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns one menu category scoped to the requested branch.',
        type: menu_category_dto_1.MenuCategoryDto,
    }),
    (0, common_1.Get)(':categoryId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuCategoriesController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantMenuCategory',
        summary: 'Create a menu category for a merchant-owned branch',
    }),
    (0, swagger_1.ApiBody)({ type: create_menu_category_dto_1.CreateMenuCategoryDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a menu category for the requested branch.',
        type: menu_category_dto_1.MenuCategoryDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, create_menu_category_dto_1.CreateMenuCategoryDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuCategoriesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantMenuCategory',
        summary: 'Update a menu category for a merchant-owned branch',
    }),
    (0, swagger_1.ApiBody)({ type: update_menu_category_dto_1.UpdateMenuCategoryDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested menu category.',
        type: menu_category_dto_1.MenuCategoryDto,
    }),
    (0, common_1.Patch)(':categoryId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, update_menu_category_dto_1.UpdateMenuCategoryDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuCategoriesController.prototype, "update", null);
exports.MerchantMenuCategoriesController = MerchantMenuCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('merchant-menu-categories'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/menu/categories'),
    __metadata("design:paramtypes", [merchant_menu_categories_service_1.MerchantMenuCategoriesService])
], MerchantMenuCategoriesController);
//# sourceMappingURL=merchant-menu-categories.controller.js.map