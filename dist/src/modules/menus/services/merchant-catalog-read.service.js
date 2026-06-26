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
exports.MerchantCatalogReadService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const merchant_menu_scope_overview_dto_1 = require("../dto/merchant-menu-scope-overview.dto");
const menus_service_1 = require("./menus.service");
let MerchantCatalogReadService = class MerchantCatalogReadService {
    constructor(menusService) {
        this.menusService = menusService;
    }
    async getOwnedBranchCatalog(userId, branchId) {
        const branchCatalog = await this.menusService.findOwnedBranchCatalogByUserId(userId, branchId);
        if (branchCatalog === null) {
            return null;
        }
        return this.menusService.buildBranchCatalog(branchCatalog);
    }
    async getOwnedBranchScopeOverview(userId, branchId) {
        const branchCatalog = await this.getOwnedBranchCatalog(userId, branchId);
        if (branchCatalog === null) {
            throw new app_exception_1.AppException('Branch catalog was not found for the requested merchant user.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return (0, merchant_menu_scope_overview_dto_1.toMerchantMenuScopeOverviewDto)(branchCatalog);
    }
};
exports.MerchantCatalogReadService = MerchantCatalogReadService;
exports.MerchantCatalogReadService = MerchantCatalogReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], MerchantCatalogReadService);
//# sourceMappingURL=merchant-catalog-read.service.js.map