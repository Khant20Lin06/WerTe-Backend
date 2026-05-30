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
exports.MerchantAccountService = void 0;
const common_1 = require("@nestjs/common");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const merchant_policy_service_1 = require("../policies/merchant-policy.service");
const merchants_repository_1 = require("../repositories/merchants.repository");
const merchant_profile_dto_1 = require("../dto/merchant-profile.dto");
const merchants_service_1 = require("./merchants.service");
let MerchantAccountService = class MerchantAccountService {
    constructor(merchantsService, merchantsRepository, merchantPolicyService) {
        this.merchantsService = merchantsService;
        this.merchantsRepository = merchantsRepository;
        this.merchantPolicyService = merchantPolicyService;
    }
    async getCurrentMerchantProfile(currentUser) {
        const merchant = await this.resolveOwnedMerchant(currentUser);
        return (0, merchant_profile_dto_1.toMerchantProfileDto)(merchant);
    }
    async updateCurrentMerchantProfile(currentUser, payload) {
        const merchant = await this.resolveOwnedMerchant(currentUser);
        const updatedMerchant = await this.merchantsRepository.update(merchant.id, {
            ...(payload.name !== undefined ? { name: payload.name } : {}),
            ...(payload.supportPhone !== undefined
                ? { supportPhone: payload.supportPhone }
                : {}),
        });
        return (0, merchant_profile_dto_1.toMerchantProfileDto)(updatedMerchant);
    }
    async resolveOwnedMerchant(currentUser) {
        const actorMerchantId = currentUser.actorContext.merchantId;
        const merchant = actorMerchantId !== undefined
            ? await this.merchantsService.findOwnedByUserId(currentUser.userId, actorMerchantId)
            : await this.merchantsService.findByUserId(currentUser.userId);
        if (merchant === null) {
            throw new app_exception_1.AppException('Merchant profile was not found for the authenticated user.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.merchantPolicyService.canAccessMerchant(currentUser, merchant)) {
            throw new app_exception_1.AppException('You are not allowed to access this merchant profile.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return merchant;
    }
};
exports.MerchantAccountService = MerchantAccountService;
exports.MerchantAccountService = MerchantAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [merchants_service_1.MerchantsService,
        merchants_repository_1.MerchantsRepository,
        merchant_policy_service_1.MerchantPolicyService])
], MerchantAccountService);
//# sourceMappingURL=merchant-account.service.js.map