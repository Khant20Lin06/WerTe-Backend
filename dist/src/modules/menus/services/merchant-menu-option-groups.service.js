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
exports.MerchantMenuOptionGroupsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const item_option_group_dto_1 = require("../dto/item-option-group.dto");
const menu_option_group_policy_service_1 = require("../policies/menu-option-group-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuOptionGroupsService = class MerchantMenuOptionGroupsService {
    constructor(prisma, menusService, menusRepository, menuOptionGroupPolicyService) {
        this.prisma = prisma;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuOptionGroupPolicyService = menuOptionGroupPolicyService;
    }
    async listItemOptionGroups(currentUser, branchId, itemId) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        const groups = await this.menusService.listOptionGroupsByMenuItemId(item.id);
        return groups.map((group) => (0, item_option_group_dto_1.toItemOptionGroupDto)(group));
    }
    async getItemOptionGroup(currentUser, branchId, itemId, optionGroupId) {
        const group = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        return (0, item_option_group_dto_1.toItemOptionGroupDto)(group);
    }
    async createItemOptionGroup(currentUser, branchId, itemId, payload) {
        const item = await this.resolveOwnedItem(currentUser, branchId, itemId);
        this.assertSelectionBounds(payload.minSelect, payload.maxSelect, payload.kind ?? client_1.ItemOptionGroupKind.ADD_ON);
        const optionGroup = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestOptionGroupSortOrderByMenuItemId(item.id, tx))?.sortOrder ?? -1) + 1;
            return this.menusRepository.createOptionGroup({
                menuItemId: item.id,
                name: payload.name,
                description: payload.description,
                kind: payload.kind ?? client_1.ItemOptionGroupKind.ADD_ON,
                minSelect: payload.minSelect,
                maxSelect: payload.maxSelect,
                sortOrder: nextSortOrder,
                isActive: payload.isActive ?? true,
            }, tx);
        });
        return (0, item_option_group_dto_1.toItemOptionGroupDto)(optionGroup);
    }
    async updateItemOptionGroup(currentUser, branchId, itemId, optionGroupId, payload) {
        const optionGroup = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        const minSelect = payload.minSelect ?? optionGroup.minSelect;
        const maxSelect = payload.maxSelect ?? optionGroup.maxSelect;
        const kind = payload.kind ?? optionGroup.kind;
        this.assertSelectionBounds(minSelect, maxSelect, kind);
        const updatedGroup = await this.menusRepository.updateOptionGroup(optionGroup.id, {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.description !== undefined
                ? { description: payload.description }
                : {}),
            ...(payload.kind !== undefined ? { kind: payload.kind } : {}),
            ...(payload.minSelect !== undefined
                ? { minSelect: payload.minSelect }
                : {}),
            ...(payload.maxSelect !== undefined
                ? { maxSelect: payload.maxSelect }
                : {}),
            ...(payload.sortOrder !== undefined
                ? { sortOrder: payload.sortOrder }
                : {}),
            ...(payload.isActive !== undefined
                ? { isActive: payload.isActive }
                : {}),
        });
        return (0, item_option_group_dto_1.toItemOptionGroupDto)(updatedGroup);
    }
    async deleteItemOptionGroup(currentUser, branchId, itemId, optionGroupId) {
        const optionGroup = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        await this.menusRepository.deleteOptionGroup(optionGroup.id);
    }
    async resolveOwnedItem(currentUser, branchId, itemId) {
        const item = await this.menusService.findItemOwnedByUserId(currentUser.userId, itemId);
        if (item === null || item.branch.id !== branchId) {
            throw new app_exception_1.AppException('Menu item was not found for the requested branch.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuOptionGroupPolicyService.canManageItem(currentUser, item)) {
            throw new app_exception_1.AppException('You are not allowed to manage option groups for this menu item.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return item;
    }
    async resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId) {
        const optionGroup = await this.menusService.findOptionGroupOwnedByUserId(currentUser.userId, optionGroupId);
        if (optionGroup === null ||
            optionGroup.menuItem.branch.id !== branchId ||
            optionGroup.menuItem.id !== itemId) {
            throw new app_exception_1.AppException('Item option group was not found for the requested menu item.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuOptionGroupPolicyService.canManageOptionGroup(currentUser, optionGroup)) {
            throw new app_exception_1.AppException('You are not allowed to manage this option group.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return optionGroup;
    }
    assertSelectionBounds(minSelect, maxSelect, kind) {
        if (maxSelect < minSelect) {
            throw new app_exception_1.AppException('Option group maxSelect must be greater than or equal to minSelect.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    minSelect,
                    maxSelect,
                },
            });
        }
        if (kind === client_1.ItemOptionGroupKind.VARIANT_SELECTOR && maxSelect > 1) {
            throw new app_exception_1.AppException('Variant selector option groups can allow at most one selection.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    minSelect,
                    maxSelect,
                    kind,
                },
            });
        }
    }
};
exports.MerchantMenuOptionGroupsService = MerchantMenuOptionGroupsService;
exports.MerchantMenuOptionGroupsService = MerchantMenuOptionGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_option_group_policy_service_1.MenuOptionGroupPolicyService])
], MerchantMenuOptionGroupsService);
//# sourceMappingURL=merchant-menu-option-groups.service.js.map