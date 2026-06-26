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
exports.MerchantsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const merchant_ownership_entity_1 = require("../entities/merchant-ownership.entity");
let MerchantsRepository = class MerchantsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.merchant.findUnique({
            where: { id },
            include: merchant_ownership_entity_1.merchantOwnershipInclude,
        });
    }
    findByUserId(userId) {
        return this.prisma.merchant.findUnique({
            where: { userId },
            include: merchant_ownership_entity_1.merchantOwnershipInclude,
        });
    }
    update(id, data) {
        return this.prisma.merchant.update({
            where: { id },
            data,
            include: merchant_ownership_entity_1.merchantOwnershipInclude,
        });
    }
};
exports.MerchantsRepository = MerchantsRepository;
exports.MerchantsRepository = MerchantsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MerchantsRepository);
//# sourceMappingURL=merchants.repository.js.map