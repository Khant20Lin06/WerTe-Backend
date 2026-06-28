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
exports.CustomerCatalogReadService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const menu_cache_service_1 = require("./menu-cache.service");
const menus_service_1 = require("./menus.service");
let CustomerCatalogReadService = class CustomerCatalogReadService {
    constructor(menusService, menuCache) {
        this.menusService = menusService;
        this.menuCache = menuCache;
    }
    async getVisibleBranchCatalog(branchId, options) {
        let branchCatalog = await this.menuCache.getCatalog(branchId);
        if (branchCatalog === null) {
            branchCatalog = await this.menusService.findBranchCatalogByBranchId(branchId);
            if (branchCatalog !== null) {
                void this.menuCache.setCatalog(branchId, branchCatalog);
            }
        }
        if (branchCatalog === null) {
            return null;
        }
        if (branchCatalog.status !== client_1.BranchStatus.ACTIVE ||
            branchCatalog.merchant.status !== client_1.MerchantStatus.ACTIVE) {
            return null;
        }
        const storeTypeCode = this.normalizeOptionalString(options?.storeTypeCode);
        if (storeTypeCode !== undefined &&
            !branchCatalog.storeTypes.some((assignment) => assignment.storeType.code.toLowerCase() === storeTypeCode)) {
            return null;
        }
        return this.menusService.buildBranchCatalog(branchCatalog, {
            activeOnly: true,
            storeTypeCode,
        });
    }
    async getVisibleBranchCatalogOrThrow(branchId, options) {
        const branchCatalog = await this.getVisibleBranchCatalog(branchId, options);
        if (branchCatalog === null) {
            throw new app_exception_1.AppException('Customer-visible branch catalog was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return branchCatalog;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        const normalizedValue = value.trim().toLowerCase();
        return normalizedValue.length > 0 ? normalizedValue : undefined;
    }
};
exports.CustomerCatalogReadService = CustomerCatalogReadService;
exports.CustomerCatalogReadService = CustomerCatalogReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [menus_service_1.MenusService,
        menu_cache_service_1.MenuCacheService])
], CustomerCatalogReadService);
//# sourceMappingURL=customer-catalog-read.service.js.map