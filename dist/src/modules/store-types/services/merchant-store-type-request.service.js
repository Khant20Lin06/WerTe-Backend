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
exports.MerchantStoreTypeRequestService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const available_store_type_dto_1 = require("../dto/available-store-type.dto");
const branch_store_type_dto_1 = require("../dto/branch-store-type.dto");
const store_type_policy_service_1 = require("../policies/store-type-policy.service");
const store_types_repository_1 = require("../repositories/store-types.repository");
const store_type_cache_service_1 = require("./store-type-cache.service");
let MerchantStoreTypeRequestService = class MerchantStoreTypeRequestService {
    constructor(prisma, storeTypesRepository, storeTypeCache, storeTypePolicyService, auditService) {
        this.prisma = prisma;
        this.storeTypesRepository = storeTypesRepository;
        this.storeTypeCache = storeTypeCache;
        this.storeTypePolicyService = storeTypePolicyService;
        this.auditService = auditService;
    }
    async listAvailableStoreTypes(currentUser) {
        this.assertCanRequestStoreTypes(currentUser);
        const cached = await this.storeTypeCache.getActiveList();
        if (cached !== null)
            return cached.map(available_store_type_dto_1.toAvailableStoreTypeDto);
        const storeTypes = await this.storeTypesRepository.listActiveStoreTypes();
        await this.storeTypeCache.setActiveList(storeTypes);
        return storeTypes.map((storeType) => (0, available_store_type_dto_1.toAvailableStoreTypeDto)(storeType));
    }
    async listCurrentMerchantBranchStoreTypes(currentUser, branchId) {
        this.assertCanRequestStoreTypes(currentUser);
        await this.requireOwnedBranch(currentUser, branchId);
        const assignments = await this.storeTypesRepository.listBranchStoreTypes({
            branchId,
        });
        return assignments.map((assignment) => (0, branch_store_type_dto_1.toBranchStoreTypeDto)(assignment));
    }
    async requestCurrentMerchantBranchStoreType(currentUser, branchId, payload) {
        this.assertCanRequestStoreTypes(currentUser);
        const assignment = await this.prisma.runInTransaction(async (tx) => {
            await this.requireOwnedBranch(currentUser, branchId, tx);
            const storeType = await this.requireRequestableStoreType(payload.storeTypeId, tx);
            const existingAssignment = await this.storeTypesRepository.findBranchStoreType(branchId, storeType.id, tx);
            if (existingAssignment?.status === client_1.BranchStoreTypeStatus.APPROVED) {
                throw new app_exception_1.AppException('This store type is already approved for the branch.', common_1.HttpStatus.CONFLICT, {
                    code: error_codes_1.ErrorCodes.conflict,
                    details: {
                        branchId,
                        storeTypeId: storeType.id,
                    },
                });
            }
            const normalizedReason = this.normalizeOptionalString(payload.reason);
            const sortOrder = payload.sortOrder ?? existingAssignment?.sortOrder ?? 0;
            if (existingAssignment === null) {
                await this.storeTypesRepository.createBranchStoreType({
                    branchId,
                    storeTypeId: storeType.id,
                    status: client_1.BranchStoreTypeStatus.PENDING,
                    isPrimary: false,
                    sortOrder,
                    requestedByUserId: currentUser.userId,
                    approvedByUserId: null,
                    approvedAt: null,
                    rejectedAt: null,
                    hiddenAt: null,
                    reason: normalizedReason,
                }, tx);
            }
            else {
                await this.storeTypesRepository.updateBranchStoreType(branchId, storeType.id, {
                    status: client_1.BranchStoreTypeStatus.PENDING,
                    isPrimary: false,
                    sortOrder,
                    requestedByUserId: currentUser.userId,
                    approvedByUserId: null,
                    approvedAt: null,
                    rejectedAt: null,
                    hiddenAt: null,
                    reason: normalizedReason,
                }, tx);
            }
            return this.requireBranchStoreType(branchId, storeType.id, tx);
        });
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'branch_store_types.requested',
            resourceType: client_1.AuditResourceType.BRANCH_STORE_TYPE,
            resourceId: `${branchId}:${payload.storeTypeId}`,
            resourceLabel: assignment.storeType.name,
            branchId,
            metadataJson: {
                status: assignment.status,
                reason: assignment.reason,
            },
        });
        return (0, branch_store_type_dto_1.toBranchStoreTypeDto)(assignment);
    }
    assertCanRequestStoreTypes(currentUser) {
        if (!this.storeTypePolicyService.canRequestStoreTypes(currentUser)) {
            throw new app_exception_1.AppException('You are not allowed to request store types.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
    }
    async requireOwnedBranch(currentUser, branchId, client) {
        const branch = await this.storeTypesRepository.findBranchSummaryById(branchId, client);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!(0, tenant_access_policy_helper_1.hasOwnedResourceAccess)({
            currentUser,
            expectedRole: client_1.UserRole.MERCHANT,
            ownerUserId: branch.merchant.userId,
            resourceId: branch.merchant.id,
            actorScopedResourceId: currentUser.actorContext.merchantId,
        })) {
            throw new app_exception_1.AppException('You are not allowed to manage store type requests for this branch.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
        return branch;
    }
    async requireRequestableStoreType(storeTypeId, client) {
        const storeType = await this.storeTypesRepository.findStoreTypeById(storeTypeId, client);
        if (storeType === null) {
            throw new app_exception_1.AppException('Store type was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (!storeType.isActive || storeType.deletedAt !== null) {
            throw new app_exception_1.AppException('This store type is not currently available for merchant requests.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
                details: {
                    storeTypeId,
                },
            });
        }
        return storeType;
    }
    async requireBranchStoreType(branchId, storeTypeId, client) {
        const assignment = await this.storeTypesRepository.findBranchStoreType(branchId, storeTypeId, client);
        if (assignment === null) {
            throw new app_exception_1.AppException('Branch store type request could not be loaded.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
            });
        }
        return assignment;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const normalizedValue = value.trim();
        return normalizedValue.length > 0 ? normalizedValue : null;
    }
};
exports.MerchantStoreTypeRequestService = MerchantStoreTypeRequestService;
exports.MerchantStoreTypeRequestService = MerchantStoreTypeRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        store_types_repository_1.StoreTypesRepository,
        store_type_cache_service_1.StoreTypeCacheService,
        store_type_policy_service_1.StoreTypePolicyService,
        audit_service_1.AuditService])
], MerchantStoreTypeRequestService);
//# sourceMappingURL=merchant-store-type-request.service.js.map