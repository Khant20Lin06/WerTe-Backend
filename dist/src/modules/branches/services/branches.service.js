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
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const branch_ownership_entity_1 = require("../entities/branch-ownership.entity");
const branches_repository_1 = require("../repositories/branches.repository");
const branch_cache_service_1 = require("./branch-cache.service");
let BranchesService = class BranchesService {
    constructor(branchesRepository, branchCache) {
        this.branchesRepository = branchesRepository;
        this.branchCache = branchCache;
    }
    async findById(id) {
        const cached = await this.branchCache.getById(id);
        if (cached !== null)
            return cached;
        const branch = await this.branchesRepository.findById(id);
        if (branch !== null) {
            await this.branchCache.setById(branch);
        }
        return branch;
    }
    async listByMerchantId(merchantId) {
        const cached = await this.branchCache.getListByMerchantId(merchantId);
        if (cached !== null)
            return cached;
        const branches = await this.branchesRepository.listByMerchantId(merchantId);
        await this.branchCache.setListByMerchantId(merchantId, branches);
        return branches;
    }
    async findOwnedByUserId(userId, branchId) {
        const branch = await this.findById(branchId);
        if (branch === null || !this.belongsToMerchantUser(branch, userId)) {
            return null;
        }
        return branch;
    }
    buildOwnership(branch) {
        return (0, branch_ownership_entity_1.buildBranchOwnership)(branch);
    }
    belongsToMerchantUser(branch, userId) {
        return branch.merchant.user.id === userId;
    }
    belongsToMerchant(branch, merchantId) {
        return branch.merchant.id === merchantId;
    }
    async invalidateCache(branchId, merchantId) {
        await this.branchCache.invalidate(branchId, merchantId);
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [branches_repository_1.BranchesRepository,
        branch_cache_service_1.BranchCacheService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map