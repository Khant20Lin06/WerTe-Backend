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
exports.CustomerProfilesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const customer_profile_ownership_entity_1 = require("../entities/customer-profile-ownership.entity");
let CustomerProfilesRepository = class CustomerProfilesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id) {
        return this.prisma.customerProfile.findUnique({
            where: { id },
            include: customer_profile_ownership_entity_1.customerProfileOwnershipInclude,
        });
    }
    findByUserId(userId) {
        return this.prisma.customerProfile.findUnique({
            where: { userId },
            include: customer_profile_ownership_entity_1.customerProfileOwnershipInclude,
        });
    }
    findAll(opts) {
        const where = {};
        if (opts.status) {
            where.user = { status: opts.status };
        }
        if (opts.search) {
            const q = opts.search.trim();
            where.OR = [
                { fullName: { contains: q, mode: 'insensitive' } },
                { user: { phone: { contains: q, mode: 'insensitive' } } },
            ];
        }
        return this.prisma.customerProfile.findMany({
            where,
            include: customer_profile_ownership_entity_1.customerProfileOwnershipInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    update(id, data) {
        return this.prisma.customerProfile.update({
            where: { id },
            data,
            include: customer_profile_ownership_entity_1.customerProfileOwnershipInclude,
        });
    }
};
exports.CustomerProfilesRepository = CustomerProfilesRepository;
exports.CustomerProfilesRepository = CustomerProfilesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerProfilesRepository);
//# sourceMappingURL=customer-profiles.repository.js.map