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
exports.MerchantMenuVariantCombinationsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const create_item_variant_combination_dto_1 = require("../dto/create-item-variant-combination.dto");
const item_variant_combination_dto_1 = require("../dto/item-variant-combination.dto");
const update_item_variant_combination_dto_1 = require("../dto/update-item-variant-combination.dto");
const merchant_menu_variant_combinations_service_1 = require("../services/merchant-menu-variant-combinations.service");
let MerchantMenuVariantCombinationsController = class MerchantMenuVariantCombinationsController {
    constructor(merchantMenuVariantCombinationsService) {
        this.merchantMenuVariantCombinationsService = merchantMenuVariantCombinationsService;
    }
    list(currentUser, branchId, itemId) {
        return this.merchantMenuVariantCombinationsService.listItemVariantCombinations(currentUser, branchId, itemId);
    }
    get(currentUser, branchId, itemId, combinationId) {
        return this.merchantMenuVariantCombinationsService.getItemVariantCombination(currentUser, branchId, itemId, combinationId);
    }
    create(currentUser, branchId, itemId, body) {
        return this.merchantMenuVariantCombinationsService.createItemVariantCombination(currentUser, branchId, itemId, body);
    }
    update(currentUser, branchId, itemId, combinationId, body) {
        return this.merchantMenuVariantCombinationsService.updateItemVariantCombination(currentUser, branchId, itemId, combinationId, body);
    }
};
exports.MerchantMenuVariantCombinationsController = MerchantMenuVariantCombinationsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantMenuItemVariantCombinations',
        summary: 'List variant combinations for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns variant combinations owned by the requested menu item.',
        type: item_variant_combination_dto_1.ItemVariantCombinationDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuVariantCombinationsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantMenuItemVariantCombination',
        summary: 'Return one variant combination for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns one variant combination scoped to the requested menu item.',
        type: item_variant_combination_dto_1.ItemVariantCombinationDto,
    }),
    (0, common_1.Get)(':combinationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('combinationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuVariantCombinationsController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantMenuItemVariantCombination',
        summary: 'Create a variant combination for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiBody)({ type: create_item_variant_combination_dto_1.CreateItemVariantCombinationDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns a variant combination for the requested menu item.',
        type: item_variant_combination_dto_1.ItemVariantCombinationDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, create_item_variant_combination_dto_1.CreateItemVariantCombinationDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuVariantCombinationsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantMenuItemVariantCombination',
        summary: 'Update a variant combination for a merchant-owned menu item',
    }),
    (0, swagger_1.ApiBody)({ type: update_item_variant_combination_dto_1.UpdateItemVariantCombinationDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the requested variant combination.',
        type: item_variant_combination_dto_1.ItemVariantCombinationDto,
    }),
    (0, common_1.Patch)(':combinationId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('combinationId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, update_item_variant_combination_dto_1.UpdateItemVariantCombinationDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuVariantCombinationsController.prototype, "update", null);
exports.MerchantMenuVariantCombinationsController = MerchantMenuVariantCombinationsController = __decorate([
    (0, swagger_1.ApiTags)('merchant-menu-item-variant-combinations'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/menu/items/:itemId/variant-combinations'),
    __metadata("design:paramtypes", [merchant_menu_variant_combinations_service_1.MerchantMenuVariantCombinationsService])
], MerchantMenuVariantCombinationsController);
//# sourceMappingURL=merchant-menu-variant-combinations.controller.js.map