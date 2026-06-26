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
exports.MerchantInventoryController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const authenticated_user_entity_1 = require("../../auth/entities/authenticated-user.entity");
const list_merchant_inventory_adjustments_query_dto_1 = require("../dto/list-merchant-inventory-adjustments-query.dto");
const merchant_inventory_adjustment_dto_1 = require("../dto/merchant-inventory-adjustment.dto");
const merchant_inventory_overview_dto_1 = require("../dto/merchant-inventory-overview.dto");
const merchant_restock_suggestions_dto_1 = require("../dto/merchant-restock-suggestions.dto");
const merchant_inventory_read_service_1 = require("../services/merchant-inventory-read.service");
let MerchantInventoryController = class MerchantInventoryController {
    constructor(merchantInventoryReadService) {
        this.merchantInventoryReadService = merchantInventoryReadService;
    }
    getOverview(currentUser, branchId) {
        return this.merchantInventoryReadService.getOwnedBranchInventoryOverview(currentUser.userId, branchId);
    }
    listAdjustments(currentUser, branchId, query) {
        return this.merchantInventoryReadService.listOwnedBranchInventoryAdjustments(currentUser.userId, branchId, query.limit ?? 25);
    }
    getRestockSuggestions(currentUser, branchId) {
        return this.merchantInventoryReadService.getOwnedBranchRestockSuggestions(currentUser.userId, branchId);
    }
};
exports.MerchantInventoryController = MerchantInventoryController;
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantBranchInventoryOverview',
        summary: 'Return tracked inventory totals and low-stock attention rows for a merchant-owned branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns tracked inventory totals plus item and option rows that need merchant attention.',
        type: merchant_inventory_overview_dto_1.MerchantInventoryOverviewDto,
    }),
    (0, common_1.Get)('overview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantInventoryController.prototype, "getOverview", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'listMerchantBranchInventoryAdjustments',
        summary: 'List recent inventory adjustment events for a merchant-owned branch',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns recent item and option inventory adjustment audit events for the requested branch.',
        type: merchant_inventory_adjustment_dto_1.MerchantInventoryAdjustmentDto,
        isArray: true,
    }),
    (0, common_1.Get)('adjustments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String, list_merchant_inventory_adjustments_query_dto_1.ListMerchantInventoryAdjustmentsQueryDto]),
    __metadata("design:returntype", void 0)
], MerchantInventoryController.prototype, "listAdjustments", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        operationId: 'getMerchantBranchRestockSuggestions',
        summary: 'Return current restock suggestions for tracked low-stock and out-of-stock branch inventory',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns suggested restock targets for tracked items and options that currently require merchant attention.',
        type: merchant_restock_suggestions_dto_1.MerchantRestockSuggestionsDto,
    }),
    (0, common_1.Get)('restock-suggestions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticated_user_entity_1.AuthenticatedUserEntity, String]),
    __metadata("design:returntype", void 0)
], MerchantInventoryController.prototype, "getRestockSuggestions", null);
exports.MerchantInventoryController = MerchantInventoryController = __decorate([
    (0, swagger_1.ApiTags)('merchant-inventory'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MERCHANT),
    (0, common_1.Controller)('merchant/branches/:branchId/inventory'),
    __metadata("design:paramtypes", [merchant_inventory_read_service_1.MerchantInventoryReadService])
], MerchantInventoryController);
//# sourceMappingURL=merchant-inventory.controller.js.map