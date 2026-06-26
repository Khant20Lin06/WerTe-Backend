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
exports.MerchantMenuOptionGroupsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_item_option_group_dto_1 = require("../dto/create-item-option-group.dto");
const item_option_group_dto_1 = require("../dto/item-option-group.dto");
const update_item_option_group_dto_1 = require("../dto/update-item-option-group.dto");
const merchant_menu_option_groups_service_1 = require("../services/merchant-menu-option-groups.service");
let MerchantMenuOptionGroupsController = class MerchantMenuOptionGroupsController {
    constructor(merchantMenuOptionGroupsService) {
        this.merchantMenuOptionGroupsService = merchantMenuOptionGroupsService;
    }
    list(currentUser, branchId, itemId) {
        return this.merchantMenuOptionGroupsService.listItemOptionGroups(currentUser, branchId, itemId);
    }
    get(currentUser, branchId, itemId, optionGroupId) {
        return this.merchantMenuOptionGroupsService.getItemOptionGroup(currentUser, branchId, itemId, optionGroupId);
    }
    create(currentUser, branchId, itemId, body) {
        return this.merchantMenuOptionGroupsService.createItemOptionGroup(currentUser, branchId, itemId, body);
    }
    update(currentUser, branchId, itemId, optionGroupId, body) {
        return this.merchantMenuOptionGroupsService.updateItemOptionGroup(currentUser, branchId, itemId, optionGroupId, body);
    }
    delete(currentUser, branchId, itemId, optionGroupId) {
        return this.merchantMenuOptionGroupsService.deleteItemOptionGroup(currentUser, branchId, itemId, optionGroupId);
    }
};
exports.MerchantMenuOptionGroupsController = MerchantMenuOptionGroupsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantMenuItemOptionGroups',
        summary: 'List option groups for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns option groups owned by the requested menu item.',
        type: item_option_group_dto_1.ItemOptionGroupDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionGroupsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantMenuItemOptionGroup',
        summary: 'Return one option group for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns one option group scoped to the requested menu item.',
        type: item_option_group_dto_1.ItemOptionGroupDto,
    }),
    (0, common_1.Get)(':optionGroupId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionGroupsController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantMenuItemOptionGroup',
        summary: 'Create an option group for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiBody)({ type: create_item_option_group_dto_1.CreateItemOptionGroupDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns an option group for the requested menu item.',
        type: item_option_group_dto_1.ItemOptionGroupDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, create_item_option_group_dto_1.CreateItemOptionGroupDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionGroupsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantMenuItemOptionGroup',
        summary: 'Update an option group for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiBody)({ type: update_item_option_group_dto_1.UpdateItemOptionGroupDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested option group.',
        type: item_option_group_dto_1.ItemOptionGroupDto,
    }),
    (0, common_1.Patch)(':optionGroupId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, update_item_option_group_dto_1.UpdateItemOptionGroupDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionGroupsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'deleteMerchantMenuItemOptionGroup',
        summary: 'Delete an option group from a merchant-owned menu item',
    }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Option group deleted.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':optionGroupId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionGroupsController.prototype, "delete", null);
exports.MerchantMenuOptionGroupsController = MerchantMenuOptionGroupsController = __decorate([
    (0, swagger_1.ApiTags)('merchant-menu-item-option-groups'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/menu/items/:itemId/option-groups'),
    __metadata("design:paramtypes", [merchant_menu_option_groups_service_1.MerchantMenuOptionGroupsService])
], MerchantMenuOptionGroupsController);
//# sourceMappingURL=merchant-menu-option-groups.controller.js.map