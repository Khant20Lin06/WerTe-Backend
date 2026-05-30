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
exports.MerchantMenuItemsService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const branches_service_1 = require("../../branches/services/branches.service");
const menu_item_dto_1 = require("../dto/menu-item.dto");
const menu_item_policy_service_1 = require("../policies/menu-item-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuItemsService = class MerchantMenuItemsService {
    constructor(prisma, branchesService, menusService, menusRepository, menuItemPolicyService) {
        this.prisma = prisma;
        this.branchesService = branchesService;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuItemPolicyService = menuItemPolicyService;
    }
    async listBranchItems(currentUser, branchId) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const items = await this.menusService.listItemsByBranchId(branch.id);
        return items.map((item) => (0, menu_item_dto_1.toMenuItemDto)(item));
    }
    async getBranchItem(currentUser, branchId, itemId) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        return (0, menu_item_dto_1.toMenuItemDto)(item);
    }
    async createBranchItem(currentUser, branchId, payload) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const category = await this.resolveOptionalOwnedCategory(currentUser, branchId, payload.categoryId);
        const item = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestItemSortOrderByBranchId(branch.id, tx))?.sortOrder ?? -1) + 1;
            return this.menusRepository.createItem({
                branchId: branch.id,
                categoryId: category?.id ?? null,
                name: payload.name,
                description: payload.description,
                imageUrl: payload.imageUrl,
                basePrice: payload.basePrice,
                sortOrder: nextSortOrder,
                isAvailable: payload.isAvailable ?? true,
            }, tx);
        });
        return (0, menu_item_dto_1.toMenuItemDto)(item);
    }
    async updateBranchItem(currentUser, branchId, itemId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const category = await this.resolveOptionalOwnedCategory(currentUser, branchId, payload.categoryId);
        const updatedItem = await this.menusRepository.updateItem(item.id, {
            ...(payload.categoryId !== undefined
                ? { categoryId: category?.id ?? null }
                : {}),
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.description !== undefined
                ? { description: payload.description }
                : {}),
            ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
            ...(payload.basePrice !== undefined
                ? { basePrice: payload.basePrice }
                : {}),
            ...(payload.sortOrder !== undefined
                ? { sortOrder: payload.sortOrder }
                : {}),
            ...(payload.isAvailable !== undefined
                ? { isAvailable: payload.isAvailable }
                : {}),
        });
        return (0, menu_item_dto_1.toMenuItemDto)(updatedItem);
    }
    async resolveOwnedBranch(currentUser, branchId) {
        const branch = await this.branchesService.findOwnedByUserId(currentUser.userId, branchId);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canManageBranchCatalog(currentUser, branch)) {
            throw new app_exception_1.AppException('You are not allowed to manage menu items for this branch.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return branch;
    }
    async resolveOwnedItem(currentUser, branchId, itemId) {
        const item = await this.menusService.findItemOwnedByUserId(currentUser.userId, itemId);
        if (item === null || item.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu item was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canManageItem(currentUser, item)) {
            throw new app_exception_1.AppException('You are not allowed to manage this menu item.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return item;
    }
    async resolveOptionalOwnedCategory(currentUser, branchId, categoryId) {
        if (categoryId === undefined) {
            return null;
        }
        if (categoryId.trim().length === 0) {
            return null;
        }
        const category = await this.menusService.findCategoryOwnedByUserId(currentUser.userId, categoryId);
        if (category === null || category.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu category was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuItemPolicyService.canUseCategory(currentUser, category)) {
            throw new app_exception_1.AppException('You are not allowed to use this menu category.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return category;
    }
};
exports.MerchantMenuItemsService = MerchantMenuItemsService;
exports.MerchantMenuItemsService = MerchantMenuItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branches_service_1.BranchesService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_item_policy_service_1.MenuItemPolicyService])
], MerchantMenuItemsService);
//# sourceMappingURL=merchant-menu-items.service.js.map