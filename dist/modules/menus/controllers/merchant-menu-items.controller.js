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
exports.MerchantMenuItemsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_menu_item_dto_1 = require("../dto/create-menu-item.dto");
const menu_item_dto_1 = require("../dto/menu-item.dto");
const update_menu_item_dto_1 = require("../dto/update-menu-item.dto");
const merchant_menu_items_service_1 = require("../services/merchant-menu-items.service");
let MerchantMenuItemsController = class MerchantMenuItemsController {
    constructor(merchantMenuItemsService) {
        this.merchantMenuItemsService = merchantMenuItemsService;
    }
    list(currentUser, branchId) {
        return this.merchantMenuItemsService.listBranchItems(currentUser, branchId);
    }
    get(currentUser, branchId, itemId) {
        return this.merchantMenuItemsService.getBranchItem(currentUser, branchId, itemId);
    }
    create(currentUser, branchId, body) {
        return this.merchantMenuItemsService.createBranchItem(currentUser, branchId, body);
    }
    update(currentUser, branchId, itemId, body) {
        return this.merchantMenuItemsService.updateBranchItem(currentUser, branchId, itemId, body);
    }
};
exports.MerchantMenuItemsController = MerchantMenuItemsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantMenuItems',
        summary: 'List menu items for a merchant-owned branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns menu items owned by the requested merchant branch.',
        type: menu_item_dto_1.MenuItemDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantMenuItem',
        summary: 'Return one menu item for a merchant-owned branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns one menu item scoped to the requested branch.',
        type: menu_item_dto_1.MenuItemDto,
    }),
    (0, common_1.Get)(':itemId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemsController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantMenuItem',
        summary: 'Create a menu item for a merchant-owned branch',
    }),
    (0, swagger_1.ApiBody)({ type: create_menu_item_dto_1.CreateMenuItemDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a menu item for the requested branch.',
        type: menu_item_dto_1.MenuItemDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, create_menu_item_dto_1.CreateMenuItemDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantMenuItem',
        summary: 'Update a menu item for a merchant-owned branch',
    }),
    (0, swagger_1.ApiBody)({ type: update_menu_item_dto_1.UpdateMenuItemDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested menu item.',
        type: menu_item_dto_1.MenuItemDto,
    }),
    (0, common_1.Patch)(':itemId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, update_menu_item_dto_1.UpdateMenuItemDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemsController.prototype, "update", null);
exports.MerchantMenuItemsController = MerchantMenuItemsController = __decorate([
    (0, swagger_1.ApiTags)('merchant-menu-items'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/menu/items'),
    __metadata("design:paramtypes", [merchant_menu_items_service_1.MerchantMenuItemsService])
], MerchantMenuItemsController);
//# sourceMappingURL=merchant-menu-items.controller.js.map