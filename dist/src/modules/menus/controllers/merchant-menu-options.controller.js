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
exports.MerchantMenuOptionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const adjust_inventory_dto_1 = require("../dto/adjust-inventory.dto");
const create_item_option_dto_1 = require("../dto/create-item-option.dto");
const item_option_dto_1 = require("../dto/item-option.dto");
const update_item_option_dto_1 = require("../dto/update-item-option.dto");
const merchant_menu_options_service_1 = require("../services/merchant-menu-options.service");
let MerchantMenuOptionsController = class MerchantMenuOptionsController {
    constructor(merchantMenuOptionsService) {
        this.merchantMenuOptionsService = merchantMenuOptionsService;
    }
    list(currentUser, branchId, itemId, optionGroupId) {
        return this.merchantMenuOptionsService.listGroupOptions(currentUser, branchId, itemId, optionGroupId);
    }
    get(currentUser, branchId, itemId, optionGroupId, optionId) {
        return this.merchantMenuOptionsService.getGroupOption(currentUser, branchId, itemId, optionGroupId, optionId);
    }
    create(currentUser, branchId, itemId, optionGroupId, body) {
        return this.merchantMenuOptionsService.createGroupOption(currentUser, branchId, itemId, optionGroupId, body);
    }
    update(currentUser, branchId, itemId, optionGroupId, optionId, body) {
        return this.merchantMenuOptionsService.updateGroupOption(currentUser, branchId, itemId, optionGroupId, optionId, body);
    }
    delete(currentUser, branchId, itemId, optionGroupId, optionId) {
        return this.merchantMenuOptionsService.deleteGroupOption(currentUser, branchId, itemId, optionGroupId, optionId);
    }
    adjustInventory(currentUser, branchId, itemId, optionGroupId, optionId, body) {
        return this.merchantMenuOptionsService.adjustGroupOptionInventory(currentUser, branchId, itemId, optionGroupId, optionId, body);
    }
};
exports.MerchantMenuOptionsController = MerchantMenuOptionsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantMenuItemOptions',
        summary: 'List options for a merchant-owned menu item option group',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns options owned by the requested option group.',
        type: item_option_dto_1.ItemOptionDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantMenuItemOption',
        summary: 'Return one option for a merchant-owned option group',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns one option scoped to the requested option group.',
        type: item_option_dto_1.ItemOptionDto,
    }),
    (0, common_1.Get)(':optionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __param(4, (0, common_1.Param)('optionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionsController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantMenuItemOption',
        summary: 'Create an option for a merchant-owned option group',
    }),
    (0, swagger_1.ApiBody)({ type: create_item_option_dto_1.CreateItemOptionDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns an option for the requested option group.',
        type: item_option_dto_1.ItemOptionDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, create_item_option_dto_1.CreateItemOptionDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantMenuItemOption',
        summary: 'Update an option for a merchant-owned option group',
    }),
    (0, swagger_1.ApiBody)({ type: update_item_option_dto_1.UpdateItemOptionDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested option.',
        type: item_option_dto_1.ItemOptionDto,
    }),
    (0, common_1.Patch)(':optionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __param(4, (0, common_1.Param)('optionId')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, String, update_item_option_dto_1.UpdateItemOptionDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'deleteMerchantMenuItemOption',
        summary: 'Delete an option from a merchant-owned option group',
    }),
    (0, swagger_1.ApiNoContentResponse)({ description: 'Option deleted.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':optionId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __param(4, (0, common_1.Param)('optionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionsController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adjustMerchantMenuItemOptionInventory',
        summary: 'Adjust tracked inventory for a merchant-owned item option',
    }),
    (0, swagger_1.ApiBody)({ type: adjust_inventory_dto_1.AdjustInventoryDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Applies a stock delta and returns the updated option.',
        type: item_option_dto_1.ItemOptionDto,
    }),
    (0, common_1.Post)(':optionId/inventory-adjustments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('optionGroupId')),
    __param(4, (0, common_1.Param)('optionId')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, String, adjust_inventory_dto_1.AdjustInventoryDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuOptionsController.prototype, "adjustInventory", null);
exports.MerchantMenuOptionsController = MerchantMenuOptionsController = __decorate([
    (0, swagger_1.ApiTags)('merchant-menu-item-options'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/menu/items/:itemId/option-groups/:optionGroupId/options'),
    __metadata("design:paramtypes", [merchant_menu_options_service_1.MerchantMenuOptionsService])
], MerchantMenuOptionsController);
//# sourceMappingURL=merchant-menu-options.controller.js.map