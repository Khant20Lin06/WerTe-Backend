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
exports.MerchantsService = void 0;
const common_1 = require("@nestjs/common");
const merchant_ownership_entity_1 = require("../entities/merchant-ownership.entity");
const merchants_repository_1 = require("../repositories/merchants.repository");
let MerchantsService = class MerchantsService {
    constructor(merchantsRepository) {
        this.merchantsRepository = merchantsRepository;
    }
    findById(id) {
        return this.merchantsRepository.findById(id);
    }
    findByUserId(userId) {
        return this.merchantsRepository.findByUserId(userId);
    }
    async findOwnedByUserId(userId, merchantId) {
        const merchant = await this.findById(merchantId);
        if (merchant === null || !this.belongsToUser(merchant, userId)) {
            return null;
        }
        return merchant;
    }
    buildOwnership(merchant) {
        return (0, merchant_ownership_entity_1.buildMerchantOwnership)(merchant);
    }
    belongsToUser(merchant, userId) {
        return merchant.user.id === userId;
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [merchants_repository_1.MerchantsRepository])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map