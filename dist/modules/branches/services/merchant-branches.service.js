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
exports.MerchantBranchesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const merchant_account_service_1 = require("../../merchants/services/merchant-account.service");
const zones_service_1 = require("../../zones/services/zones.service");
const branch_dto_1 = require("../dto/branch.dto");
const branch_policy_service_1 = require("../policies/branch-policy.service");
const branches_repository_1 = require("../repositories/branches.repository");
let MerchantBranchesService = class MerchantBranchesService {
    constructor(prisma, merchantAccountService, branchesRepository, branchPolicyService, zonesService) {
        this.prisma = prisma;
        this.merchantAccountService = merchantAccountService;
        this.branchesRepository = branchesRepository;
        this.branchPolicyService = branchPolicyService;
        this.zonesService = zonesService;
    }
    async listCurrentMerchantBranches(currentUser) {
        const merchant = await this.resolveCurrentMerchant(currentUser);
        const branches = await this.branchesRepository.listByMerchantId(merchant.id);
        return branches.map((branch) => (0, branch_dto_1.toBranchDto)(branch));
    }
    async getCurrentMerchantBranch(currentUser, branchId) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        return (0, branch_dto_1.toBranchDto)(branch);
    }
    async createCurrentMerchantBranch(currentUser, payload) {
        const merchant = await this.resolveCurrentMerchant(currentUser);
        const zoneIds = this.normalizeZoneIds(payload.zoneIds);
        await this.assertValidZoneAssignments(zoneIds);
        const branch = await this.prisma.runInTransaction(async (tx) => {
            const createdBranch = await this.branchesRepository.create({
                merchantId: merchant.id,
                name: payload.name,
                contactPhone: payload.contactPhone,
                line1: payload.line1,
                township: payload.township,
                latitude: payload.latitude,
                longitude: payload.longitude,
                status: payload.status,
            }, tx);
            if (zoneIds.length > 0) {
                await this.branchesRepository.assignZones(createdBranch.id, zoneIds, tx);
            }
            return this.branchesRepository.findById(createdBranch.id, tx);
        });
        if (branch === null) {
            throw new app_exception_1.AppException('Created branch could not be loaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        return (0, branch_dto_1.toBranchDto)(branch);
    }
    async updateCurrentMerchantBranch(currentUser, branchId, payload) {
        const branch = await this.resolveOwnedBranch(currentUser, branchId);
        const zoneIds = payload.zoneIds !== undefined ? this.normalizeZoneIds(payload.zoneIds) : null;
        if (zoneIds !== null) {
            await this.assertValidZoneAssignments(zoneIds);
        }
        const updatedBranch = await this.prisma.runInTransaction(async (tx) => {
            await this.branchesRepository.update(branch.id, {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.contactPhone !== undefined
                    ? { contactPhone: payload.contactPhone }
                    : {}),
                ...(payload.line1 !== undefined ? { line1: payload.line1 } : {}),
                ...(payload.township !== undefined
                    ? { township: payload.township }
                    : {}),
                ...(payload.latitude !== undefined
                    ? { latitude: payload.latitude }
                    : {}),
                ...(payload.longitude !== undefined
                    ? { longitude: payload.longitude }
                    : {}),
                ...(payload.status !== undefined ? { status: payload.status } : {}),
            }, tx);
            if (zoneIds !== null) {
                await this.branchesRepository.clearZoneAssignments(branch.id, tx);
                await this.branchesRepository.assignZones(branch.id, zoneIds, tx);
            }
            return this.branchesRepository.findById(branch.id, tx);
        });
        if (updatedBranch === null) {
            throw new app_exception_1.AppException('Updated branch could not be loaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        return (0, branch_dto_1.toBranchDto)(updatedBranch);
    }
    async resolveCurrentMerchant(currentUser) {
        return this.merchantAccountService.resolveOwnedMerchant(currentUser);
    }
    async resolveOwnedBranch(currentUser, branchId) {
        const branch = await this.branchesRepository.findById(branchId);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!this.branchPolicyService.canManageBranch(currentUser, branch)) {
            throw new app_exception_1.AppException('You are not allowed to manage this branch.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return branch;
    }
    normalizeZoneIds(zoneIds) {
        if (zoneIds === undefined) {
            return [];
        }
        return [...new Set(zoneIds)];
    }
    async assertValidZoneAssignments(zoneIds) {
        if (zoneIds.length === 0) {
            return;
        }
        const zones = await this.zonesService.listByIds(zoneIds);
        if (zones.length !== zoneIds.length) {
            throw new app_exception_1.AppException('One or more branch zones do not exist.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    zoneIds,
                },
            });
        }
        const inactiveZones = zones.filter((zone) => zone.status !== client_1.ZoneStatus.ACTIVE);
        if (inactiveZones.length > 0) {
            throw new app_exception_1.AppException('Inactive zones cannot be assigned to a branch.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    zoneIds: inactiveZones.map((zone) => zone.id),
                },
            });
        }
    }
};
exports.MerchantBranchesService = MerchantBranchesService;
exports.MerchantBranchesService = MerchantBranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        merchant_account_service_1.MerchantAccountService,
        branches_repository_1.BranchesRepository,
        branch_policy_service_1.BranchPolicyService,
        zones_service_1.ZonesService])
], MerchantBranchesService);
//# sourceMappingURL=merchant-branches.service.js.map