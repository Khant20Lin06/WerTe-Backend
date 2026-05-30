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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantMenuCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const branches_service_1 = require("../../branches/services/branches.service");
const menu_category_dto_1 = require("../dto/menu-category.dto");
const menu_category_policy_service_1 = require("../policies/menu-category-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuCategoriesService = class MerchantMenuCategoriesService {
    constructor(prisma, branchesService, menusService, menusRepository, menuCategoryPolicyService) {
        this.prisma = prisma;
        this.branchesService = branchesService;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuCategoryPolicyService = menuCategoryPolicyService;
    }
    async listBranchCategories(currentUser, branchId) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const categories = await this.menusService.listCategoriesByBranchId(branch.id);
        return categories.map((category) => (0, menu_category_dto_1.toMenuCategoryDto)(category));
    }
    async getBranchCategory(currentUser, branchId, categoryId) {
        const category = await this.resolveOwnedCategory(currentUser, branchId, categoryId);
        return (0, menu_category_dto_1.toMenuCategoryDto)(category);
    }
    async createBranchCategory(currentUser, branchId, payload) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const category = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestCategorySortOrderByBranchId(branch.id, tx))?.sortOrder ?? -1) + 1;
            return this.menusRepository.createCategory({
                branchId: branch.id,
                name: payload.name,
                description: payload.description,
                sortOrder: nextSortOrder,
                isActive: payload.isActive ?? true,
            }, tx);
        });
        return (0, menu_category_dto_1.toMenuCategoryDto)(category);
    }
    async updateBranchCategory(currentUser, branchId, categoryId, payload) {
        const category = await this.resolveOwnedCategory(currentUser, branchId, categoryId);
        const updatedCategory = await this.menusRepository.updateCategory(category.id, {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.description !== undefined
                ? { description: payload.description }
                : {}),
            ...(payload.sortOrder !== undefined
                ? { sortOrder: payload.sortOrder }
                : {}),
            ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
        });
        return (0, menu_category_dto_1.toMenuCategoryDto)(updatedCategory);
    }
    async resolveOwnedBranch(currentUser, branchId) {
        const branch = await this.branchesService.findOwnedByUserId(currentUser.userId, branchId);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuCategoryPolicyService.canManageBranchCatalog(currentUser, branch)) {
            throw new app_exception_1.AppException('You are not allowed to manage categories for this branch.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return branch;
    }
    async resolveOwnedCategory(currentUser, branchId, categoryId) {
        const category = await this.menusService.findCategoryOwnedByUserId(currentUser.userId, categoryId);
        if (category === null || category.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu category was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuCategoryPolicyService.canManageCategory(currentUser, category)) {
            throw new app_exception_1.AppException('You are not allowed to manage this menu category.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return category;
    }
};
exports.MerchantMenuCategoriesService = MerchantMenuCategoriesService;
exports.MerchantMenuCategoriesService = MerchantMenuCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branches_service_1.BranchesService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_category_policy_service_1.MenuCategoryPolicyService])
], MerchantMenuCategoriesService);
//# sourceMappingURL=merchant-menu-categories.service.js.map