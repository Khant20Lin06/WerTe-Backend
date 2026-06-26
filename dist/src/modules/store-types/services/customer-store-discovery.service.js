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
exports.CustomerStoreDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../common/constants/error-codes");
const app_exception_1 = require("../../../common/exceptions/app.exception");
const tenant_access_policy_helper_1 = require("../../../common/policies/tenant-access-policy.helper");
const prisma_service_1 = require("../../../infrastructure/database/prisma.service");
const customer_catalog_read_service_1 = require("../../menus/services/customer-catalog-read.service");
const customer_store_catalog_entry_dto_1 = require("../dto/customer-store-catalog-entry.dto");
const customer_store_detail_dto_1 = require("../dto/customer-store-detail.dto");
const customer_store_facets_dto_1 = require("../dto/customer-store-facets.dto");
const customer_store_summary_dto_1 = require("../dto/customer-store-summary.dto");
const list_customer_stores_query_dto_1 = require("../dto/list-customer-stores-query.dto");
const store_types_repository_1 = require("../repositories/store-types.repository");
const discovery_cache_service_1 = require("./discovery-cache.service");
let CustomerStoreDiscoveryService = class CustomerStoreDiscoveryService {
    constructor(storeTypesRepository, customerCatalogReadService, discoveryCache, prisma) {
        this.storeTypesRepository = storeTypesRepository;
        this.customerCatalogReadService = customerCatalogReadService;
        this.discoveryCache = discoveryCache;
        this.prisma = prisma;
    }
    async listDiscoverableStores(currentUser, query) {
        this.assertCanDiscoverStores(currentUser);
        const { branches, selectedStoreTypeCodes } = await this.findDiscoverableBranches(query);
        const sorted = this.sortBranches(branches, query.sortBy);
        const branchIds = sorted.map((b) => b.id);
        const ratingMap = await this.fetchBranchRatingMap(branchIds);
        return sorted.map((branch) => this.toCustomerStoreSummary(branch, selectedStoreTypeCodes, ratingMap.get(branch.id)));
    }
    async getDiscoverableStoreFacets(currentUser, query) {
        this.assertCanDiscoverStores(currentUser);
        const { branches } = await this.findDiscoverableBranches(query);
        return (0, customer_store_facets_dto_1.toCustomerStoreFacetsDto)(branches);
    }
    async getDiscoverableStoreDetail(currentUser, branchId) {
        this.assertCanDiscoverStores(currentUser);
        const [branch, catalog, ratingAggregate] = await Promise.all([
            this.findDiscoverableBranchOrThrow(branchId),
            this.customerCatalogReadService.getVisibleBranchCatalogOrThrow(branchId),
            this.fetchSingleBranchRating(branchId),
        ]);
        return (0, customer_store_detail_dto_1.toCustomerStoreDetailDto)(branch, catalog, ratingAggregate);
    }
    async getDiscoverableStoreCatalogEntry(currentUser, branchId, query) {
        this.assertCanDiscoverStores(currentUser);
        const branch = await this.findDiscoverableBranchOrThrow(branchId);
        const selectedStoreTypeCode = this.normalizeOptionalString(query.storeTypeCode)?.toLowerCase();
        const catalog = await this.customerCatalogReadService.getVisibleBranchCatalogOrThrow(branchId, {
            storeTypeCode: selectedStoreTypeCode,
        });
        const selectedCatalogEntry = this.resolveSelectedCatalogEntry(branch, selectedStoreTypeCode);
        return (0, customer_store_catalog_entry_dto_1.toCustomerStoreCatalogEntryDto)(branch, catalog, selectedCatalogEntry);
    }
    async fetchBranchRatingMap(branchIds) {
        if (branchIds.length === 0)
            return new Map();
        const rows = await this.prisma.rating.groupBy({
            by: ['targetId'],
            where: { targetType: client_1.RatingTargetType.BRANCH, targetId: { in: branchIds } },
            _avg: { score: true },
            _count: { score: true },
        });
        const map = new Map();
        for (const row of rows) {
            map.set(row.targetId, {
                averageRating: row._avg.score !== null ? Math.round(row._avg.score * 10) / 10 : null,
                reviewCount: row._count.score,
            });
        }
        return map;
    }
    async fetchSingleBranchRating(branchId) {
        const map = await this.fetchBranchRatingMap([branchId]);
        return map.get(branchId) ?? { averageRating: null, reviewCount: 0 };
    }
    assertCanDiscoverStores(currentUser) {
        if (!(0, tenant_access_policy_helper_1.hasRole)(currentUser, client_1.UserRole.CUSTOMER)) {
            throw new app_exception_1.AppException('You are not allowed to discover customer stores.', common_1.HttpStatus.FORBIDDEN, {
                code: error_codes_1.ErrorCodes.forbidden,
            });
        }
    }
    toCustomerStoreSummary(branch, selectedStoreTypeCodes, rating) {
        if (branch.storeTypes.length === 0) {
            throw new app_exception_1.AppException('Customer-visible store discovery record is missing approved store types.', common_1.HttpStatus.INTERNAL_SERVER_ERROR, {
                code: error_codes_1.ErrorCodes.internalServerError,
                details: {
                    branchId: branch.id,
                },
            });
        }
        return (0, customer_store_summary_dto_1.toCustomerStoreSummaryDto)(branch, {
            preferredStoreTypeCodes: selectedStoreTypeCodes,
            averageRating: rating?.averageRating ?? null,
            reviewCount: rating?.reviewCount ?? 0,
        });
    }
    async findDiscoverableBranches(query) {
        const storeTypeCodes = this.normalizeStoreTypeCodes(query.storeTypeCode, query.storeTypeCodes);
        const filter = {
            branchId: this.normalizeOptionalString(query.branchId),
            merchantId: this.normalizeOptionalString(query.merchantId),
            storeTypeCodes,
            township: this.normalizeOptionalString(query.township),
            keyword: this.normalizeOptionalString(query.keyword),
        };
        let branches;
        if (this.discoveryCache.isCacheable(filter)) {
            const cached = await this.discoveryCache.getList({
                storeTypeCodes: filter.storeTypeCodes,
                township: filter.township,
            });
            if (cached !== null) {
                branches = cached;
            }
            else {
                branches = await this.storeTypesRepository.listCustomerDiscoverableBranches(filter);
                await this.discoveryCache.setList({ storeTypeCodes: filter.storeTypeCodes, township: filter.township }, branches);
            }
        }
        else {
            branches = await this.storeTypesRepository.listCustomerDiscoverableBranches(filter);
        }
        return {
            branches: branches.filter((branch) => branch.storeTypes.length > 0),
            selectedStoreTypeCodes: storeTypeCodes,
        };
    }
    async findDiscoverableBranchOrThrow(branchId) {
        const { branches } = await this.findDiscoverableBranches({ branchId });
        const branch = branches[0];
        if (branch !== undefined) {
            return branch;
        }
        throw new app_exception_1.AppException('Customer-visible store detail was not found.', common_1.HttpStatus.NOT_FOUND, {
            code: error_codes_1.ErrorCodes.notFound,
            details: {
                branchId,
            },
        });
    }
    resolveSelectedCatalogEntry(branch, selectedStoreTypeCode) {
        const selectedAssignment = selectedStoreTypeCode === undefined
            ? branch.storeTypes[0]
            : branch.storeTypes.find((assignment) => assignment.storeType.code.toLowerCase() === selectedStoreTypeCode);
        if (selectedAssignment !== undefined) {
            return {
                storeType: {
                    id: selectedAssignment.storeType.id,
                    code: selectedAssignment.storeType.code,
                    name: selectedAssignment.storeType.name,
                    sortOrder: selectedAssignment.storeType.sortOrder,
                },
                isPrimary: selectedAssignment.isPrimary,
            };
        }
        throw new app_exception_1.AppException('Customer-visible store catalog entry was not found for the requested store type.', common_1.HttpStatus.NOT_FOUND, {
            code: error_codes_1.ErrorCodes.notFound,
            details: {
                branchId: branch.id,
                storeTypeCode: selectedStoreTypeCode,
            },
        });
    }
    sortBranches(branches, sortBy) {
        const resolvedSortBy = sortBy ?? list_customer_stores_query_dto_1.CustomerStoreSortBy.NAME_ASC;
        return [...branches].sort((left, right) => {
            switch (resolvedSortBy) {
                case list_customer_stores_query_dto_1.CustomerStoreSortBy.NAME_DESC:
                    return right.name.localeCompare(left.name);
                case list_customer_stores_query_dto_1.CustomerStoreSortBy.TOWNSHIP_ASC:
                    return (left.township.localeCompare(right.township) ||
                        left.name.localeCompare(right.name));
                case list_customer_stores_query_dto_1.CustomerStoreSortBy.TOWNSHIP_DESC:
                    return (right.township.localeCompare(left.township) ||
                        left.name.localeCompare(right.name));
                case list_customer_stores_query_dto_1.CustomerStoreSortBy.MERCHANT_NAME_ASC:
                    return (left.merchant.name.localeCompare(right.merchant.name) ||
                        left.name.localeCompare(right.name));
                case list_customer_stores_query_dto_1.CustomerStoreSortBy.NAME_ASC:
                default:
                    return left.name.localeCompare(right.name);
            }
        });
    }
    normalizeStoreTypeCodes(storeTypeCode, storeTypeCodes) {
        const normalizedValues = [
            this.normalizeOptionalString(storeTypeCode)?.toLowerCase(),
            ...(storeTypeCodes ?? []).map((code) => code.trim().toLowerCase()),
        ].filter((value) => value !== undefined && value.length > 0);
        const uniqueValues = [...new Set(normalizedValues)];
        return uniqueValues.length > 0 ? uniqueValues : undefined;
    }
    normalizeOptionalString(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        const normalizedValue = value.trim();
        return normalizedValue.length > 0 ? normalizedValue : undefined;
    }
};
exports.CustomerStoreDiscoveryService = CustomerStoreDiscoveryService;
exports.CustomerStoreDiscoveryService = CustomerStoreDiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [store_types_repository_1.StoreTypesRepository,
        customer_catalog_read_service_1.CustomerCatalogReadService,
        discovery_cache_service_1.DiscoveryCacheService,
        prisma_service_1.PrismaService])
], CustomerStoreDiscoveryService);
//# sourceMappingURL=customer-store-discovery.service.js.map