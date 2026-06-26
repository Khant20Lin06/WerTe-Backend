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
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const branches_service_1 = require("../../branches/services/branches.service");
const menu_category_dto_1 = require("../dto/menu-category.dto");
const menu_category_policy_service_1 = require("../policies/menu-category-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuCategoriesService = class MerchantMenuCategoriesService {
    constructor(prisma, branchesService, menusService, menusRepository, menuCategoryPolicyService, auditService) {
        this.prisma = prisma;
        this.branchesService = branchesService;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuCategoryPolicyService = menuCategoryPolicyService;
        this.auditService = auditService;
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
            const scopedStoreTypeIds = await this.resolveScopedStoreTypeIds(branch.id, payload.storeTypeIds, tx);
            const createdCategory = await this.menusRepository.createCategory({
                branchId: branch.id,
                name: payload.name,
                description: payload.description,
                sortOrder: nextSortOrder,
                isActive: payload.isActive ?? true,
            }, tx);
            await this.menusRepository.replaceCategoryStoreTypes(createdCategory.id, scopedStoreTypeIds, tx);
            return this.menusRepository.findCategoryById(createdCategory.id, tx);
        });
        if (category === null) {
            throw new app_exception_1.AppException('Created menu category could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'menu_categories.scope_created',
            resourceType: client_1.AuditResourceType.MENU_CATEGORY,
            resourceId: category.id,
            resourceLabel: category.name,
            branchId: branch.id,
            metadataJson: {
                afterScope: this.buildScopeSnapshot(category.storeTypes),
                isActive: category.isActive,
                sortOrder: category.sortOrder,
            },
        });
        return (0, menu_category_dto_1.toMenuCategoryDto)(category);
    }
    async updateBranchCategory(currentUser, branchId, categoryId, payload) {
        const category = await this.resolveOwnedCategory(currentUser, branchId, categoryId);
        const updatedCategory = await this.prisma.runInTransaction(async (tx) => {
            const nextCategory = await this.menusRepository.updateCategory(category.id, {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.description !== undefined
                    ? { description: payload.description }
                    : {}),
                ...(payload.sortOrder !== undefined
                    ? { sortOrder: payload.sortOrder }
                    : {}),
                ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
            }, tx);
            if (payload.storeTypeIds !== undefined) {
                const scopedStoreTypeIds = await this.resolveScopedStoreTypeIds(branchId, payload.storeTypeIds, tx);
                await this.menusRepository.replaceCategoryStoreTypes(category.id, scopedStoreTypeIds, tx);
                return this.menusRepository.findCategoryById(nextCategory.id, tx);
            }
            return nextCategory;
        });
        if (updatedCategory === null) {
            throw new app_exception_1.AppException('Updated menu category could not be reloaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        if (payload.storeTypeIds !== undefined) {
            await this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: 'menu_categories.scope_updated',
                resourceType: client_1.AuditResourceType.MENU_CATEGORY,
                resourceId: updatedCategory.id,
                resourceLabel: updatedCategory.name,
                branchId: updatedCategory.branch.id,
                metadataJson: {
                    beforeScope: this.buildScopeSnapshot(category.storeTypes),
                    afterScope: this.buildScopeSnapshot(updatedCategory.storeTypes),
                    isActive: updatedCategory.isActive,
                    sortOrder: updatedCategory.sortOrder,
                },
            });
        }
        return (0, menu_category_dto_1.toMenuCategoryDto)(updatedCategory);
    }
    async deleteBranchCategory(currentUser, branchId, categoryId) {
        const category = await this.resolveOwnedCategory(currentUser, branchId, categoryId);
        await this.menusRepository.deleteCategory(category.id);
    }
    buildScopeSnapshot(storeTypes) {
        return {
            scopeMode: this.toScopeMode(storeTypes.length),
            storeTypeIds: storeTypes.map((assignment) => assignment.storeType.id),
            storeTypeCodes: storeTypes.map((assignment) => assignment.storeType.code),
        };
    }
    toScopeMode(storeTypeCount) {
        return storeTypeCount === 0
            ? 'ALL_APPROVED_STORE_TYPES'
            : 'SELECTED_STORE_TYPES';
    }
    async resolveScopedStoreTypeIds(branchId, storeTypeIds, client) {
        const normalizedStoreTypeIds = this.normalizeStoreTypeIds(storeTypeIds);
        if (normalizedStoreTypeIds.length === 0) {
            return [];
        }
        const approvedStoreTypes = await this.menusRepository.listApprovedStoreTypesByBranchId(branchId, client);
        const approvedStoreTypeIdSet = new Set(approvedStoreTypes.map((assignment) => assignment.storeType.id));
        const invalidStoreTypeIds = normalizedStoreTypeIds.filter((storeTypeId) => !approvedStoreTypeIdSet.has(storeTypeId));
        if (invalidStoreTypeIds.length > 0) {
            throw new app_exception_1.AppException('Category storeTypeIds must belong to approved active store types for the branch.', common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.validationFailed,
                details: {
                    branchId,
                    invalidStoreTypeIds,
                },
            });
        }
        return normalizedStoreTypeIds;
    }
    normalizeStoreTypeIds(storeTypeIds) {
        if (storeTypeIds === undefined) {
            return [];
        }
        const normalizedValues = storeTypeIds
            .map((storeTypeId) => storeTypeId.trim())
            .filter((storeTypeId) => storeTypeId.length > 0);
        return [...new Set(normalizedValues)];
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
        menu_category_policy_service_1.MenuCategoryPolicyService,
        audit_service_1.AuditService])
], MerchantMenuCategoriesService);
//# sourceMappingURL=merchant-menu-categories.service.js.map