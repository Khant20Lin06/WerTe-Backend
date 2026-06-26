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
exports.StoreTypesRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const branch_store_type_management_entity_1 = require("../entities/branch-store-type-management.entity");
const customer_store_discovery_entity_1 = require("../entities/customer-store-discovery.entity");
const store_type_management_entity_1 = require("../entities/store-type-management.entity");
const branchSummarySelect = client_1.Prisma.validator()({
    id: true,
    merchantId: true,
    name: true,
    status: true,
    storeType: true,
    primaryStoreTypeId: true,
    merchant: {
        select: {
            id: true,
            userId: true,
            name: true,
            storeType: true,
            primaryStoreTypeId: true,
        },
    },
});
let StoreTypesRepository = class StoreTypesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    listStoreTypes(client = this.prisma) {
        return client.storeType.findMany({
            include: store_type_management_entity_1.storeTypeManagementInclude,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    listActiveStoreTypes(client = this.prisma) {
        return client.storeType.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            include: store_type_management_entity_1.storeTypeManagementInclude,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    findStoreTypeById(id, client = this.prisma) {
        return client.storeType.findUnique({
            where: { id },
            include: store_type_management_entity_1.storeTypeManagementInclude,
        });
    }
    findStoreTypeByCode(code, client = this.prisma) {
        return client.storeType.findUnique({
            where: { code },
            include: store_type_management_entity_1.storeTypeManagementInclude,
        });
    }
    createStoreType(data, client = this.prisma) {
        return client.storeType.create({
            data,
            include: store_type_management_entity_1.storeTypeManagementInclude,
        });
    }
    updateStoreType(id, data, client = this.prisma) {
        return client.storeType.update({
            where: { id },
            data,
            include: store_type_management_entity_1.storeTypeManagementInclude,
        });
    }
    findBranchSummaryById(branchId, client = this.prisma) {
        return client.branch.findUnique({
            where: { id: branchId },
            select: branchSummarySelect,
        });
    }
    listBranchStoreTypes(filter, client = this.prisma) {
        return client.branchStoreType.findMany({
            where: {
                ...(filter.branchId !== undefined ? { branchId: filter.branchId } : {}),
                ...(filter.storeTypeId !== undefined
                    ? { storeTypeId: filter.storeTypeId }
                    : {}),
                ...(filter.status !== undefined ? { status: filter.status } : {}),
            },
            include: branch_store_type_management_entity_1.branchStoreTypeManagementInclude,
            orderBy: [
                { branch: { name: 'asc' } },
                { sortOrder: 'asc' },
                { createdAt: 'asc' },
            ],
        });
    }
    findBranchStoreType(branchId, storeTypeId, client = this.prisma) {
        return client.branchStoreType.findUnique({
            where: {
                branchId_storeTypeId: {
                    branchId,
                    storeTypeId,
                },
            },
            include: branch_store_type_management_entity_1.branchStoreTypeManagementInclude,
        });
    }
    createBranchStoreType(data, client = this.prisma) {
        return client.branchStoreType.create({
            data,
            include: branch_store_type_management_entity_1.branchStoreTypeManagementInclude,
        });
    }
    updateBranchStoreType(branchId, storeTypeId, data, client = this.prisma) {
        return client.branchStoreType.update({
            where: {
                branchId_storeTypeId: {
                    branchId,
                    storeTypeId,
                },
            },
            data,
            include: branch_store_type_management_entity_1.branchStoreTypeManagementInclude,
        });
    }
    clearBranchPrimaryAssignments(branchId, client = this.prisma) {
        return client.branchStoreType.updateMany({
            where: {
                branchId,
                isPrimary: true,
            },
            data: {
                isPrimary: false,
            },
        });
    }
    listApprovedBranchStoreTypes(branchId, client = this.prisma) {
        return client.branchStoreType.findMany({
            where: {
                branchId,
                status: client_1.BranchStoreTypeStatus.APPROVED,
            },
            include: branch_store_type_management_entity_1.branchStoreTypeManagementInclude,
            orderBy: [
                { isPrimary: 'desc' },
                { sortOrder: 'asc' },
                { createdAt: 'asc' },
            ],
        });
    }
    listCustomerDiscoverableBranches(filter, client = this.prisma) {
        return client.branch.findMany({
            where: {
                status: client_1.BranchStatus.ACTIVE,
                ...(filter.branchId !== undefined ? { id: filter.branchId } : {}),
                ...(filter.merchantId !== undefined
                    ? { merchantId: filter.merchantId }
                    : {}),
                ...(filter.township !== undefined
                    ? {
                        township: {
                            contains: filter.township,
                            mode: 'insensitive',
                        },
                    }
                    : {}),
                merchant: {
                    status: client_1.MerchantStatus.ACTIVE,
                },
                storeTypes: {
                    some: {
                        status: client_1.BranchStoreTypeStatus.APPROVED,
                        storeType: {
                            isActive: true,
                            deletedAt: null,
                            ...(filter.storeTypeCodes !== undefined
                                ? {
                                    code: {
                                        in: filter.storeTypeCodes,
                                    },
                                }
                                : {}),
                        },
                    },
                },
                ...(filter.keyword !== undefined
                    ? {
                        OR: [
                            {
                                name: {
                                    contains: filter.keyword,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                township: {
                                    contains: filter.keyword,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                merchant: {
                                    name: {
                                        contains: filter.keyword,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        ],
                    }
                    : {}),
            },
            include: customer_store_discovery_entity_1.customerStoreDiscoveryInclude,
            orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
        });
    }
    updateBranchPrimaryStoreType(branchId, data, client = this.prisma) {
        return client.branch.update({
            where: { id: branchId },
            data,
        });
    }
};
exports.StoreTypesRepository = StoreTypesRepository;
exports.StoreTypesRepository = StoreTypesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoreTypesRepository);
//# sourceMappingURL=store-types.repository.js.map