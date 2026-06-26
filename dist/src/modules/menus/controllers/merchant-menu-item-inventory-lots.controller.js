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
exports.MerchantMenuItemInventoryLotsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const adjust_inventory_dto_1 = require("../dto/adjust-inventory.dto");
const create_item_inventory_lot_dto_1 = require("../dto/create-item-inventory-lot.dto");
const item_inventory_lot_dto_1 = require("../dto/item-inventory-lot.dto");
const update_item_inventory_lot_dto_1 = require("../dto/update-item-inventory-lot.dto");
const merchant_menu_item_inventory_lots_service_1 = require("../services/merchant-menu-item-inventory-lots.service");
let MerchantMenuItemInventoryLotsController = class MerchantMenuItemInventoryLotsController {
    constructor(merchantMenuItemInventoryLotsService) {
        this.merchantMenuItemInventoryLotsService = merchantMenuItemInventoryLotsService;
    }
    list(currentUser, branchId, itemId) {
        return this.merchantMenuItemInventoryLotsService.listItemInventoryLots(currentUser, branchId, itemId);
    }
    create(currentUser, branchId, itemId, body) {
        return this.merchantMenuItemInventoryLotsService.createItemInventoryLot(currentUser, branchId, itemId, body);
    }
    update(currentUser, branchId, itemId, lotId, body) {
        return this.merchantMenuItemInventoryLotsService.updateItemInventoryLot(currentUser, branchId, itemId, lotId, body);
    }
    adjust(currentUser, branchId, itemId, lotId, body) {
        return this.merchantMenuItemInventoryLotsService.adjustItemInventoryLot(currentUser, branchId, itemId, lotId, body);
    }
};
exports.MerchantMenuItemInventoryLotsController = MerchantMenuItemInventoryLotsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantMenuItemInventoryLots',
        summary: 'List inventory lots for a merchant-owned tracked menu item',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns inventory lots for the requested menu item.',
        type: item_inventory_lot_dto_1.ItemInventoryLotDto,
        isArray: true,
    }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemInventoryLotsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'createMerchantMenuItemInventoryLot',
        summary: 'Create a new inventory lot for a merchant-owned tracked menu item',
    }),
    (0, swagger_1.ApiBody)({ type: create_item_inventory_lot_dto_1.CreateItemInventoryLotDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Creates and returns the inventory lot.',
        type: item_inventory_lot_dto_1.ItemInventoryLotDto,
    }),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, create_item_inventory_lot_dto_1.CreateItemInventoryLotDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemInventoryLotsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'updateMerchantMenuItemInventoryLot',
        summary: 'Update lot metadata for a merchant-owned tracked menu item',
    }),
    (0, swagger_1.ApiBody)({ type: update_item_inventory_lot_dto_1.UpdateItemInventoryLotDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Updates and returns the inventory lot.',
        type: item_inventory_lot_dto_1.ItemInventoryLotDto,
    }),
    (0, common_1.Patch)(':lotId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('lotId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, update_item_inventory_lot_dto_1.UpdateItemInventoryLotDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemInventoryLotsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'adjustMerchantMenuItemInventoryLot',
        summary: 'Adjust remaining quantity for a merchant-owned inventory lot',
    }),
    (0, swagger_1.ApiBody)({ type: adjust_inventory_dto_1.AdjustInventoryDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Applies a quantity delta to the inventory lot and returns the updated lot.',
        type: item_inventory_lot_dto_1.ItemInventoryLotDto,
    }),
    (0, common_1.Post)(':lotId/inventory-adjustments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Param)('lotId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, String, String, adjust_inventory_dto_1.AdjustInventoryDto]),
    __metadata("design:returntype", void 0)
], MerchantMenuItemInventoryLotsController.prototype, "adjust", null);
exports.MerchantMenuItemInventoryLotsController = MerchantMenuItemInventoryLotsController = __decorate([
    (0, swagger_1.ApiTags)('merchant-menu-item-inventory-lots'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/menu/items/:itemId/inventory-lots'),
    __metadata("design:paramtypes", [merchant_menu_item_inventory_lots_service_1.MerchantMenuItemInventoryLotsService])
], MerchantMenuItemInventoryLotsController);
//# sourceMappingURL=merchant-menu-item-inventory-lots.controller.js.map