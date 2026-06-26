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
exports.StoreTypeManagementService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const audit_service_1 = require("../../audit/services/audit.service");
const branch_store_type_dto_1 = require("../dto/branch-store-type.dto");
const store_type_dto_1 = require("../dto/store-type.dto");
const store_type_policy_service_1 = require("../policies/store-type-policy.service");
const store_types_repository_1 = require("../repositories/store-types.repository");
const discovery_cache_service_1 = require("./discovery-cache.service");
const store_type_cache_service_1 = require("./store-type-cache.service");
let StoreTypeManagementService = class StoreTypeManagementService {
    constructor(prisma, storeTypesRepository, storeTypeCache, discoveryCache, storeTypePolicyService, auditService) {
        this.prisma = prisma;
        this.storeTypesRepository = storeTypesRepository;
        this.storeTypeCache = storeTypeCache;
        this.discoveryCache = discoveryCache;
        this.storeTypePolicyService = storeTypePolicyService;
        this.auditService = auditService;
    }
    async listStoreTypes(currentUser) {
        this.assertCanManageStoreTypes(currentUser);
        const cached = await this.storeTypeCache.getList();
        if (cached !== null)
            return cached.map(store_type_dto_1.toStoreTypeDto);
        const storeTypes = await this.storeTypesRepository.listStoreTypes();
        await this.storeTypeCache.setList(storeTypes);
        return storeTypes.map((storeType) => (0, store_type_dto_1.toStoreTypeDto)(storeType));
    }
    async getStoreType(currentUser, storeTypeId) {
        this.assertCanManageStoreTypes(currentUser);
        const storeType = await this.requireStoreType(storeTypeId);
        return (0, store_type_dto_1.toStoreTypeDto)(storeType);
    }
    async createStoreType(currentUser, payload) {
        this.assertCanManageStoreTypes(currentUser);
        const code = this.normalizeStoreTypeCode(payload.code);
        const existingStoreType = await this.storeTypesRepository.findStoreTypeByCode(code);
        if (existingStoreType !== null) {
            throw new app_exception_1.AppException('Store type code is already in use.', common_1.HttpStatus.CONFLICT, {
                code: error_codes_1.ErrorCodes.conflict,
                details: {
                    code,
                },
            });
        }
        const storeType = await this.storeTypesRepository.createStoreType({
            code,
            name: this.normalizeRequiredString(payload.name, 'Store type name'),
            description: this.normalizeOptionalString(payload.description),
            iconUrl: this.normalizeOptionalString(payload.iconUrl),
            isActive: payload.isActive ?? true,
            isSystem: false,
            sortOrder: payload.sortOrder ?? 0,
            ...(payload.isActive === false ? { deletedAt: new Date() } : {}),
        });
        await Promise.all([
            this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: 'store_types.created',
                resourceType: client_1.AuditResourceType.STORE_TYPE,
                resourceId: storeType.id,
                resourceLabel: storeType.name,
                metadataJson: {
                    code: storeType.code,
                    isActive: storeType.isActive,
                    isSystem: storeType.isSystem,
                },
            }),
            this.storeTypeCache.invalidateAll(),
            this.discoveryCache.invalidateAll(),
        ]);
        return (0, store_type_dto_1.toStoreTypeDto)(storeType);
    }
    async updateStoreType(currentUser, storeTypeId, payload) {
        this.assertCanManageStoreTypes(currentUser);
        const existingStoreType = await this.requireStoreType(storeTypeId);
        const isActive = payload.isActive ?? existingStoreType.isActive;
        const storeType = await this.storeTypesRepository.updateStoreType(storeTypeId, {
            ...(payload.name !== undefined
                ? {
                    name: this.normalizeRequiredString(payload.name, 'Store type name'),
                }
                : {}),
            ...(payload.description !== undefined
                ? {
                    description: this.normalizeOptionalString(payload.description),
                }
                : {}),
            ...(payload.iconUrl !== undefined
                ? {
                    iconUrl: this.normalizeOptionalString(payload.iconUrl),
                }
                : {}),
            ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
            ...(payload.isActive !== undefined
                ? {
                    isActive,
                    deletedAt: isActive ? null : existingStoreType.deletedAt ?? new Date(),
                }
                : {}),
        });
        await Promise.all([
            this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: 'store_types.updated',
                resourceType: client_1.AuditResourceType.STORE_TYPE,
                resourceId: storeType.id,
                resourceLabel: storeType.name,
                metadataJson: {
                    isActive: storeType.isActive,
                    sortOrder: storeType.sortOrder,
                },
            }),
            this.storeTypeCache.invalidateOne(storeType.id, storeType.code),
            this.discoveryCache.invalidateAll(),
        ]);
        return (0, store_type_dto_1.toStoreTypeDto)(storeType);
    }
    async archiveStoreType(currentUser, storeTypeId) {
        this.assertCanManageStoreTypes(currentUser);
        const storeType = await this.requireStoreType(storeTypeId);
        if (!storeType.isActive && storeType.deletedAt !== null) {
            return (0, store_type_dto_1.toStoreTypeDto)(storeType);
        }
        const archivedStoreType = await this.storeTypesRepository.updateStoreType(storeTypeId, {
            isActive: false,
            deletedAt: new Date(),
        });
        await Promise.all([
            this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: 'store_types.archived',
                resourceType: client_1.AuditResourceType.STORE_TYPE,
                resourceId: archivedStoreType.id,
                resourceLabel: archivedStoreType.name,
                metadataJson: {
                    code: archivedStoreType.code,
                },
            }),
            this.storeTypeCache.invalidateOne(archivedStoreType.id, archivedStoreType.code),
            this.discoveryCache.invalidateAll(),
        ]);
        return (0, store_type_dto_1.toStoreTypeDto)(archivedStoreType);
    }
    async activateStoreType(currentUser, storeTypeId) {
        this.assertCanManageStoreTypes(currentUser);
        await this.requireStoreType(storeTypeId);
        const activatedStoreType = await this.storeTypesRepository.updateStoreType(storeTypeId, {
            isActive: true,
            deletedAt: null,
        });
        await Promise.all([
            this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: 'store_types.activated',
                resourceType: client_1.AuditResourceType.STORE_TYPE,
                resourceId: activatedStoreType.id,
                resourceLabel: activatedStoreType.name,
                metadataJson: {
                    code: activatedStoreType.code,
                },
            }),
            this.storeTypeCache.invalidateOne(activatedStoreType.id, activatedStoreType.code),
            this.discoveryCache.invalidateAll(),
        ]);
        return (0, store_type_dto_1.toStoreTypeDto)(activatedStoreType);
    }
    async listBranchStoreTypes(currentUser, query) {
        this.assertCanManageStoreTypes(currentUser);
        const assignments = await this.storeTypesRepository.listBranchStoreTypes(query);
        return assignments.map((assignment) => (0, branch_store_type_dto_1.toBranchStoreTypeDto)(assignment));
    }
    async listBranchStoreTypesByBranch(currentUser, branchId) {
        this.assertCanManageStoreTypes(currentUser);
        await this.requireBranch(branchId);
        return this.listBranchStoreTypes(currentUser, { branchId });
    }
    async assignBranchStoreType(currentUser, branchId, payload) {
        this.assertCanManageStoreTypes(currentUser);
        const targetStatus = payload.status ?? client_1.BranchStoreTypeStatus.APPROVED;
        this.assertPrimaryCompatible(targetStatus, payload.isPrimary);
        const assignment = await this.prisma.runInTransaction(async (tx) => {
            const branch = await this.requireBranch(branchId, tx);
            const storeType = await this.requireStoreType(payload.storeTypeId, tx);
            this.assertStoreTypeCanBeActivated(storeType.isActive, storeType.name);
            const existingAssignment = await this.storeTypesRepository.findBranchStoreType(branch.id, storeType.id, tx);
            const nextSortOrder = payload.sortOrder ?? existingAssignment?.sortOrder ?? 0;
            const nextReason = payload.reason !== undefined
                ? this.normalizeOptionalString(payload.reason)
                : existingAssignment?.reason ?? null;
            if (existingAssignment === null) {
                await this.storeTypesRepository.createBranchStoreType(this.buildBranchStoreTypeCreateInput({
                    branchId: branch.id,
                    storeTypeId: storeType.id,
                    currentUser,
                    status: targetStatus,
                    isPrimary: payload.isPrimary ?? false,
                    sortOrder: nextSortOrder,
                    reason: nextReason,
                }), tx);
            }
            else {
                await this.storeTypesRepository.updateBranchStoreType(branch.id, storeType.id, this.buildBranchStoreTypeUpdateInput({
                    currentUser,
                    status: targetStatus,
                    isPrimary: payload.isPrimary ?? existingAssignment.isPrimary,
                    sortOrder: nextSortOrder,
                    reason: nextReason,
                }), tx);
            }
            await this.syncBranchPrimaryStoreType(branch.id, tx);
            return this.requireBranchStoreType(branch.id, storeType.id, tx);
        });
        await this.auditService.logAction({
            actorType: client_1.AuditActorType.USER,
            actorUserId: currentUser.userId,
            actorRole: currentUser.role,
            actionSource: client_1.AuditActionSource.API,
            action: 'branch_store_types.assigned',
            resourceType: client_1.AuditResourceType.BRANCH_STORE_TYPE,
            resourceId: `${branchId}:${payload.storeTypeId}`,
            resourceLabel: assignment.storeType.name,
            branchId,
            metadataJson: {
                status: assignment.status,
                isPrimary: assignment.isPrimary,
                reason: assignment.reason,
            },
        });
        return (0, branch_store_type_dto_1.toBranchStoreTypeDto)(assignment);
    }
    async approveBranchStoreType(currentUser, branchId, storeTypeId, payload) {
        return this.updateBranchStoreTypeLifecycle(currentUser, branchId, storeTypeId, client_1.BranchStoreTypeStatus.APPROVED, payload, 'branch_store_types.approved');
    }
    async rejectBranchStoreType(currentUser, branchId, storeTypeId, payload) {
        return this.updateBranchStoreTypeLifecycle(currentUser, branchId, storeTypeId, client_1.BranchStoreTypeStatus.REJECTED, payload, 'branch_store_types.rejected');
    }
    async hideBranchStoreType(currentUser, branchId, storeTypeId, payload) {
        return this.updateBranchStoreTypeLifecycle(currentUser, branchId, storeTypeId, client_1.BranchStoreTypeStatus.HIDDEN, payload, 'branch_store_types.hidden');
    }
    async unhideBranchStoreType(currentUser, branchId, storeTypeId, payload) {
        return this.updateBranchStoreTypeLifecycle(currentUser, branchId, storeTypeId, client_1.BranchStoreTypeStatus.APPROVED, payload, 'branch_store_types.unhidden');
    }
    async updateBranchStoreTypeLifecycle(currentUser, branchId, storeTypeId, status, payload, auditAction) {
        this.assertCanManageStoreTypes(currentUser);
        this.assertPrimaryCompatible(status, payload.isPrimary);
        const assignment = await this.prisma.runInTransaction(async (tx) => {
            const existingAssignment = await this.requireBranchStoreType(branchId, storeTypeId, tx);
            if (status === client_1.BranchStoreTypeStatus.APPROVED) {
                this.assertStoreTypeCanBeActivated(existingAssignment.storeType.isActive, existingAssignment.storeType.name);
            }
            await this.storeTypesRepository.updateBranchStoreType(branchId, storeTypeId, this.buildBranchStoreTypeUpdateInput({
                currentUser,
                status,
                isPrimary: status === client_1.BranchStoreTypeStatus.APPROVED
                    ? payload.isPrimary ?? existingAssignment.isPrimary
                    : false,
                sortOrder: payload.sortOrder ?? existingAssignment.sortOrder,
                reason: payload.reason !== undefined
                    ? this.normalizeOptionalString(payload.reason)
                    : existingAssignment.reason,
            }), tx);
            await this.syncBranchPrimaryStoreType(branchId, tx);
            return this.requireBranchStoreType(branchId, storeTypeId, tx);
        });
        await Promise.all([
            this.auditService.logAction({
                actorType: client_1.AuditActorType.USER,
                actorUserId: currentUser.userId,
                actorRole: currentUser.role,
                actionSource: client_1.AuditActionSource.API,
                action: auditAction,
                resourceType: client_1.AuditResourceType.BRANCH_STORE_TYPE,
                resourceId: `${branchId}:${storeTypeId}`,
                resourceLabel: assignment.storeType.name,
                branchId,
                metadataJson: {
                    status: assignment.status,
                    isPrimary: assignment.isPrimary,
                    reason: assignment.reason,
                },
            }),
            this.discoveryCache.invalidateAll(),
        ]);
        return (0, branch_store_type_dto_1.toBranchStoreTypeDto)(assignment);
    }
    async requireStoreType(storeTypeId, client) {
        if (client === undefined) {
            const cached = await this.storeTypeCache.getById(storeTypeId);
            if (cached !== null) {
                return cached;
            }
        }
        const storeType = await this.storeTypesRepository.findStoreTypeById(storeTypeId, client);
        if (storeType === null) {
            throw new app_exception_1.AppException('Store type was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        if (client === undefined) {
            await this.storeTypeCache.setById(storeType);
        }
        return storeType;
    }
    async requireBranch(branchId, client) {
        const branch = await this.storeTypesRepository.findBranchSummaryById(branchId, client);
        if (branch === null) {
            throw new app_exception_1.AppException('Branch was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return branch;
    }
    async requireBranchStoreType(branchId, storeTypeId, client) {
        const assignment = await this.storeTypesRepository.findBranchStoreType(branchId, storeTypeId, client);
        if (assignment === null) {
            throw new app_exception_1.AppException('Branch store type assignment was not found.', common_1.HttpStatus.NOT_FOUND, {
                code: error_codes_1.ErrorCodes.notFound,
            });
        }
        return assignment;
    }
    assertCanManageStoreTypes(currentUser) {
        if (!this.storeTypePolicyService.canManageStoreTypes(currentUser)) {
            throw new app_exception_1.AppException('You are not allowed to manage store types.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
    }
    assertPrimaryCompatible(status, isPrimary) {
        if (isPrimary === true && status !== client_1.BranchStoreTypeStatus.APPROVED) {
            throw new app_exception_1.AppException('Only approved branch store types can be marked as primary.', common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    assertStoreTypeCanBeActivated(isActive, storeTypeName) {
        if (!isActive) {
            throw new app_exception_1.AppException(`Inactive store type "${storeTypeName}" cannot be approved for a branch.`, common_1.HttpStatus.UNPROCESSABLE_ENTITY, {
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            });
        }
    }
    normalizeStoreTypeCode(code) {
        return this.normalizeRequiredString(code, 'Store type code').toLowerCase();
    }
    normalizeRequiredString(value, fieldName) {
        const normalizedValue = value.trim();
        if (normalizedValue.length === 0) {
            throw new app_exception_1.AppException(`${fieldName} is required.`, common_1.HttpStatus.BAD_REQUEST, {
                code: error_codes_1.ErrorCodes.badRequest,
            });
        }
        return normalizedValue;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return null;
        }
        const normalizedValue = value.trim();
        return normalizedValue.length > 0 ? normalizedValue : null;
    }
    buildBranchStoreTypeCreateInput(input) {
        const now = new Date();
        return {
            branchId: input.branchId,
            storeTypeId: input.storeTypeId,
            status: input.status,
            isPrimary: input.status === client_1.BranchStoreTypeStatus.APPROVED && input.isPrimary,
            sortOrder: input.sortOrder,
            requestedByUserId: input.currentUser.userId,
            approvedByUserId: input.status === client_1.BranchStoreTypeStatus.APPROVED
                ? input.currentUser.userId
                : null,
            approvedAt: input.status === client_1.BranchStoreTypeStatus.APPROVED ? now : null,
            rejectedAt: input.status === client_1.BranchStoreTypeStatus.REJECTED ? now : null,
            hiddenAt: input.status === client_1.BranchStoreTypeStatus.HIDDEN ? now : null,
            reason: input.reason,
        };
    }
    buildBranchStoreTypeUpdateInput(input) {
        const now = new Date();
        return {
            status: input.status,
            isPrimary: input.status === client_1.BranchStoreTypeStatus.APPROVED && input.isPrimary,
            sortOrder: input.sortOrder,
            approvedByUserId: input.status === client_1.BranchStoreTypeStatus.APPROVED
                ? input.currentUser.userId
                : null,
            approvedAt: input.status === client_1.BranchStoreTypeStatus.APPROVED ? now : null,
            rejectedAt: input.status === client_1.BranchStoreTypeStatus.REJECTED ? now : null,
            hiddenAt: input.status === client_1.BranchStoreTypeStatus.HIDDEN ? now : null,
            reason: input.reason,
        };
    }
    async syncBranchPrimaryStoreType(branchId, client) {
        const approvedAssignments = await this.storeTypesRepository.listApprovedBranchStoreTypes(branchId, client);
        const primaryAssignment = approvedAssignments.find((assignment) => assignment.isPrimary) ??
            approvedAssignments[0] ??
            null;
        await this.storeTypesRepository.clearBranchPrimaryAssignments(branchId, client);
        if (primaryAssignment !== null) {
            await this.storeTypesRepository.updateBranchStoreType(branchId, primaryAssignment.storeType.id, {
                isPrimary: true,
            }, client);
            await this.storeTypesRepository.updateBranchPrimaryStoreType(branchId, {
                primaryStoreTypeId: primaryAssignment.storeType.id,
                storeType: primaryAssignment.storeType.code,
            }, client);
            return;
        }
        await this.storeTypesRepository.updateBranchPrimaryStoreType(branchId, {
            primaryStoreTypeId: null,
        }, client);
    }
};
exports.StoreTypeManagementService = StoreTypeManagementService;
exports.StoreTypeManagementService = StoreTypeManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        store_types_repository_1.StoreTypesRepository,
        store_type_cache_service_1.StoreTypeCacheService,
        discovery_cache_service_1.DiscoveryCacheService,
        store_type_policy_service_1.StoreTypePolicyService,
        audit_service_1.AuditService])
], StoreTypeManagementService);
//# sourceMappingURL=store-type-management.service.js.map