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
exports.MerchantMenuOptionsService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const item_option_dto_1 = require("../dto/item-option.dto");
const menu_option_policy_service_1 = require("../policies/menu-option-policy.service");
const menus_repository_1 = require("../repositories/menus.repository");
const menus_service_1 = require("./menus.service");
let MerchantMenuOptionsService = class MerchantMenuOptionsService {
    constructor(prisma, menusService, menusRepository, menuOptionPolicyService) {
        this.prisma = prisma;
        this.menusService = menusService;
        this.menusRepository = menusRepository;
        this.menuOptionPolicyService = menuOptionPolicyService;
    }
    async listGroupOptions(currentUser, branchId, itemId, optionGroupId) {
        const optionGroup = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        const options = await this.menusService.listOptionsByOptionGroupId(optionGroup.id);
        return options.map((option) => (0, item_option_dto_1.toItemOptionDto)(option));
    }
    async getGroupOption(currentUser, branchId, itemId, optionGroupId, optionId) {
        const option = await this.resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId);
        return (0, item_option_dto_1.toItemOptionDto)(option);
    }
    async createGroupOption(currentUser, branchId, itemId, optionGroupId, payload) {
        const optionGroup = await this.resolveOwnedOptionGroup(currentUser, branchId, itemId, optionGroupId);
        const option = await this.prisma.runInTransaction(async (tx) => {
            const nextSortOrder = payload.sortOrder ??
                ((await this.menusRepository.findHighestOptionSortOrderByOptionGroupId(optionGroup.id, tx))?.sortOrder ?? -1) + 1;
            return this.menusRepository.createOption({
                groupId: optionGroup.id,
                name: payload.name,
                priceDelta: payload.priceDelta,
                sortOrder: nextSortOrder,
                isActive: payload.isActive ?? true,
            }, tx);
        });
        return (0, item_option_dto_1.toItemOptionDto)(option);
    }
    async updateGroupOption(currentUser, branchId, itemId, optionGroupId, optionId, payload) {
        const option = await this.resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId);
        const updatedOption = await this.menusRepository.updateOption(option.id, {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.priceDelta !== undefined
                ? { priceDelta: payload.priceDelta }
                : {}),
            ...(payload.sortOrder !== undefined
                ? { sortOrder: payload.sortOrder }
                : {}),
            ...(payload.isActive !== undefined
                ? { isActive: payload.isActive }
                : {}),
        });
        return (0, item_option_dto_1.toItemOptionDto)(updatedOption);
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
        if (!this.menuOptionPolicyService.canManageOptionGroup(currentUser, optionGroup)) {
            throw new app_exception_1.AppException('You are not allowed to manage options for this option group.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return optionGroup;
    }
    async resolveOwnedOption(currentUser, branchId, itemId, optionGroupId, optionId) {
        const option = await this.menusService.findOptionOwnedByUserId(currentUser.userId, optionId);
        if (option === null ||
            option.group.menuItem.branch.id !== branchId ||
            option.group.menuItem.id !== itemId ||
            option.group.id !== optionGroupId) {
            throw new app_exception_1.AppException('Item option was not found for the requested option group.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.menuOptionPolicyService.canManageOption(currentUser, option)) {
            throw new app_exception_1.AppException('You are not allowed to manage this option.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return option;
    }
};
exports.MerchantMenuOptionsService = MerchantMenuOptionsService;
exports.MerchantMenuOptionsService = MerchantMenuOptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        menus_service_1.MenusService,
        menus_repository_1.MenusRepository,
        menu_option_policy_service_1.MenuOptionPolicyService])
], MerchantMenuOptionsService);
//# sourceMappingURL=merchant-menu-options.service.js.map