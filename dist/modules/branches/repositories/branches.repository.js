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
exports.BranchesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const branch_ownership_entity_1 = require("../entities/branch-ownership.entity");
let BranchesRepository = class BranchesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findById(id, client = this.prisma) {
        return client.branch.findUnique({
            where: { id },
            include: branch_ownership_entity_1.branchOwnershipInclude,
        });
    }
    listByMerchantId(merchantId) {
        return this.prisma.branch.findMany({
            where: { merchantId },
            include: branch_ownership_entity_1.branchOwnershipInclude,
            orderBy: [{ createdAt: 'desc' }],
        });
    }
    create(data, client = this.prisma) {
        return client.branch.create({
            data,
            include: branch_ownership_entity_1.branchOwnershipInclude,
        });
    }
    update(id, data, client = this.prisma) {
        return client.branch.update({
            where: { id },
            data,
            include: branch_ownership_entity_1.branchOwnershipInclude,
        });
    }
    clearZoneAssignments(branchId, client = this.prisma) {
        return client.branchZone.deleteMany({
            where: {
                branchId,
            },
        });
    }
    assignZones(branchId, zoneIds, client = this.prisma) {
        if (zoneIds.length === 0) {
            return Promise.resolve({ count: 0 });
        }
        return client.branchZone.createMany({
            data: zoneIds.map((zoneId) => ({
                branchId,
                zoneId,
            })),
            skipDuplicates: true,
        });
    }
};
exports.BranchesRepository = BranchesRepository;
exports.BranchesRepository = BranchesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchesRepository);
//# sourceMappingURL=branches.repository.js.map