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
exports.AdminMerchantManagementService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const merchant_ownership_entity_1 = require("../entities/merchant-ownership.entity");
const merchant_profile_dto_1 = require("../dto/merchant-profile.dto");
const merchants_service_1 = require("./merchants.service");
let AdminMerchantManagementService = class AdminMerchantManagementService {
    constructor(prisma, merchantsService) {
        this.prisma = prisma;
        this.merchantsService = merchantsService;
    }
    async listMerchants(status) {
        const where = status ? { status } : {};
        const merchants = await this.prisma.merchant.findMany({
            where,
            include: merchant_ownership_entity_1.merchantOwnershipInclude,
            orderBy: { createdAt: 'desc' },
        });
        return merchants.map(merchant_profile_dto_1.toMerchantProfileDto);
    }
    async updateMerchantStatus(merchantId, status) {
        const existing = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            include: merchant_ownership_entity_1.merchantOwnershipInclude,
        });
        if (existing === null) {
            throw new app_exception_1.AppException(`Merchant '${merchantId}' was not found.`, common_1.HttpStatus.NOT_FOUND, { code: error_codes_1.ErrorCodes.notFound });
        }
        const updated = await this.prisma.merchant.update({
            where: { id: merchantId },
            data: { status },
            include: merchant_ownership_entity_1.merchantOwnershipInclude,
        });
        await this.merchantsService.invalidateCache(updated.id, updated.user.id);
        return (0, merchant_profile_dto_1.toMerchantProfileDto)(updated);
    }
};
exports.AdminMerchantManagementService = AdminMerchantManagementService;
exports.AdminMerchantManagementService = AdminMerchantManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        merchants_service_1.MerchantsService])
], AdminMerchantManagementService);
//# sourceMappingURL=admin-merchant-management.service.js.map