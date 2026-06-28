import { HttpStatus, Injectable } from '@nestjs/common';
import { RatingTargetType, UserRole } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { hasRole } from '../../../common/policies/tenant-access-policy.helper';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { CustomerCatalogReadService } from '../../menus/services/customer-catalog-read.service';
import {
  CustomerStoreCatalogEntryDto,
  toCustomerStoreCatalogEntryDto,
} from '../dto/customer-store-catalog-entry.dto';
import {
  CustomerStoreCatalogEntrySummaryDto,
  CustomerStoreDetailDto,
  toCustomerStoreDetailDto,
} from '../dto/customer-store-detail.dto';
import {
  CustomerStoreFacetsDto,
  toCustomerStoreFacetsDto,
} from '../dto/customer-store-facets.dto';
import { GetCustomerStoreCatalogQueryDto } from '../dto/get-customer-store-catalog-query.dto';
import {
  CustomerStoreSummaryDto,
  toCustomerStoreSummaryDto,
} from '../dto/customer-store-summary.dto';
import {
  CustomerStoreSortBy,
  ListCustomerStoresQueryDto,
} from '../dto/list-customer-stores-query.dto';
import { CustomerStoreDiscoveryRecord } from '../entities/customer-store-discovery.entity';
import { StoreTypesRepository } from '../repositories/store-types.repository';
import { DiscoveryCacheService } from './discovery-cache.service';

@Injectable()
export class CustomerStoreDiscoveryService {
  constructor(
    private readonly storeTypesRepository: StoreTypesRepository,
    private readonly customerCatalogReadService: CustomerCatalogReadService,
    private readonly discoveryCache: DiscoveryCacheService,
    private readonly prisma: PrismaService,
  ) {}

  async listDiscoverableStores(
    currentUser: AuthenticatedUserEntity | null,
    query: ListCustomerStoresQueryDto,
  ): Promise<CustomerStoreSummaryDto[]> {

    const { branches, selectedStoreTypeCodes } =
      await this.findDiscoverableBranches(query);

    const sorted = this.sortBranches(branches, query.sortBy);
    const branchIds = sorted.map((b) => b.id);
    const ratingMap = await this.fetchBranchRatingMap(branchIds);

    return sorted.map((branch) =>
      this.toCustomerStoreSummary(branch, selectedStoreTypeCodes, ratingMap.get(branch.id)),
    );
  }

  async getDiscoverableStoreFacets(
    currentUser: AuthenticatedUserEntity | null,
    query: ListCustomerStoresQueryDto,
  ): Promise<CustomerStoreFacetsDto> {

    const { branches } = await this.findDiscoverableBranches(query);

    return toCustomerStoreFacetsDto(branches);
  }

  async getDiscoverableStoreDetail(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
  ): Promise<CustomerStoreDetailDto> {
    this.assertCanDiscoverStores(currentUser);

    const [branch, catalog, ratingAggregate] = await Promise.all([
      this.findDiscoverableBranchOrThrow(branchId),
      this.customerCatalogReadService.getVisibleBranchCatalogOrThrow(branchId),
      this.fetchSingleBranchRating(branchId),
    ]);

    return toCustomerStoreDetailDto(branch, catalog, ratingAggregate);
  }

  async getDiscoverableStoreCatalogEntry(
    currentUser: AuthenticatedUserEntity,
    branchId: string,
    query: GetCustomerStoreCatalogQueryDto,
  ): Promise<CustomerStoreCatalogEntryDto> {
    this.assertCanDiscoverStores(currentUser);

    const branch = await this.findDiscoverableBranchOrThrow(branchId);
    const selectedStoreTypeCode =
      this.normalizeOptionalString(query.storeTypeCode)?.toLowerCase();
    const catalog =
      await this.customerCatalogReadService.getVisibleBranchCatalogOrThrow(
        branchId,
        {
          storeTypeCode: selectedStoreTypeCode,
        },
      );
    const selectedCatalogEntry = this.resolveSelectedCatalogEntry(
      branch,
      selectedStoreTypeCode,
    );

    return toCustomerStoreCatalogEntryDto(
      branch,
      catalog,
      selectedCatalogEntry,
    );
  }

  private async fetchBranchRatingMap(
    branchIds: string[],
  ): Promise<Map<string, { averageRating: number | null; reviewCount: number }>> {
    if (branchIds.length === 0) return new Map();
    const rows = await this.prisma.rating.groupBy({
      by: ['targetId'],
      where: { targetType: RatingTargetType.BRANCH, targetId: { in: branchIds } },
      _avg: { score: true },
      _count: { score: true },
    });
    const map = new Map<string, { averageRating: number | null; reviewCount: number }>();
    for (const row of rows) {
      map.set(row.targetId, {
        averageRating: row._avg.score !== null ? Math.round(row._avg.score * 10) / 10 : null,
        reviewCount: row._count.score,
      });
    }
    return map;
  }

  private async fetchSingleBranchRating(
    branchId: string,
  ): Promise<{ averageRating: number | null; reviewCount: number }> {
    const map = await this.fetchBranchRatingMap([branchId]);
    return map.get(branchId) ?? { averageRating: null, reviewCount: 0 };
  }

  private assertCanDiscoverStores(currentUser: AuthenticatedUserEntity) {
    if (!hasRole(currentUser, UserRole.CUSTOMER)) {
      throw new AppException(
        'You are not allowed to discover customer stores.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }
  }

  private toCustomerStoreSummary(
    branch: CustomerStoreDiscoveryRecord,
    selectedStoreTypeCodes?: string[],
    rating?: { averageRating: number | null; reviewCount: number },
  ): CustomerStoreSummaryDto {
    if (branch.storeTypes.length === 0) {
      throw new AppException(
        'Customer-visible store discovery record is missing approved store types.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          code: ErrorCodes.internalServerError,
          details: {
            branchId: branch.id,
          },
        },
      );
    }

    return toCustomerStoreSummaryDto(branch, {
      preferredStoreTypeCodes: selectedStoreTypeCodes,
      averageRating: rating?.averageRating ?? null,
      reviewCount: rating?.reviewCount ?? 0,
    });
  }

  private async findDiscoverableBranches(
    query: ListCustomerStoresQueryDto,
  ): Promise<{
    branches: CustomerStoreDiscoveryRecord[];
    selectedStoreTypeCodes?: string[];
  }> {
    const storeTypeCodes = this.normalizeStoreTypeCodes(
      query.storeTypeCode,
      query.storeTypeCodes,
    );

    const filter = {
      branchId: this.normalizeOptionalString(query.branchId),
      merchantId: this.normalizeOptionalString(query.merchantId),
      storeTypeCodes,
      township: this.normalizeOptionalString(query.township),
      keyword: this.normalizeOptionalString(query.keyword),
    };

    let branches: CustomerStoreDiscoveryRecord[];

    if (this.discoveryCache.isCacheable(filter)) {
      const cached = await this.discoveryCache.getList({
        storeTypeCodes: filter.storeTypeCodes,
        township: filter.township,
      });

      if (cached !== null) {
        branches = cached;
      } else {
        branches = await this.storeTypesRepository.listCustomerDiscoverableBranches(filter);
        await this.discoveryCache.setList(
          { storeTypeCodes: filter.storeTypeCodes, township: filter.township },
          branches,
        );
      }
    } else {
      branches = await this.storeTypesRepository.listCustomerDiscoverableBranches(filter);
    }

    return {
      branches: branches.filter((branch) => branch.storeTypes.length > 0),
      selectedStoreTypeCodes: storeTypeCodes,
    };
  }

  private async findDiscoverableBranchOrThrow(
    branchId: string,
  ): Promise<CustomerStoreDiscoveryRecord> {
    const { branches } = await this.findDiscoverableBranches({ branchId });
    const branch = branches[0];

    if (branch !== undefined) {
      return branch;
    }

    throw new AppException(
      'Customer-visible store detail was not found.',
      HttpStatus.NOT_FOUND,
      {
        code: ErrorCodes.notFound,
        details: {
          branchId,
        },
      },
    );
  }

  private resolveSelectedCatalogEntry(
    branch: CustomerStoreDiscoveryRecord,
    selectedStoreTypeCode?: string,
  ): CustomerStoreCatalogEntrySummaryDto {
    const selectedAssignment =
      selectedStoreTypeCode === undefined
        ? branch.storeTypes[0]
        : branch.storeTypes.find(
            (assignment) =>
              assignment.storeType.code.toLowerCase() === selectedStoreTypeCode,
          );

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

    throw new AppException(
      'Customer-visible store catalog entry was not found for the requested store type.',
      HttpStatus.NOT_FOUND,
      {
        code: ErrorCodes.notFound,
        details: {
          branchId: branch.id,
          storeTypeCode: selectedStoreTypeCode,
        },
      },
    );
  }

  private sortBranches(
    branches: CustomerStoreDiscoveryRecord[],
    sortBy?: CustomerStoreSortBy,
  ): CustomerStoreDiscoveryRecord[] {
    const resolvedSortBy = sortBy ?? CustomerStoreSortBy.NAME_ASC;

    return [...branches].sort((left, right) => {
      switch (resolvedSortBy) {
        case CustomerStoreSortBy.NAME_DESC:
          return right.name.localeCompare(left.name);
        case CustomerStoreSortBy.TOWNSHIP_ASC:
          return (
            left.township.localeCompare(right.township) ||
            left.name.localeCompare(right.name)
          );
        case CustomerStoreSortBy.TOWNSHIP_DESC:
          return (
            right.township.localeCompare(left.township) ||
            left.name.localeCompare(right.name)
          );
        case CustomerStoreSortBy.MERCHANT_NAME_ASC:
          return (
            left.merchant.name.localeCompare(right.merchant.name) ||
            left.name.localeCompare(right.name)
          );
        case CustomerStoreSortBy.NAME_ASC:
        default:
          return left.name.localeCompare(right.name);
      }
    });
  }

  private normalizeStoreTypeCodes(
    storeTypeCode?: string | null,
    storeTypeCodes?: string[] | null,
  ): string[] | undefined {
    const normalizedValues = [
      this.normalizeOptionalString(storeTypeCode)?.toLowerCase(),
      ...(storeTypeCodes ?? []).map((code) => code.trim().toLowerCase()),
    ].filter((value): value is string => value !== undefined && value.length > 0);

    const uniqueValues = [...new Set(normalizedValues)];

    return uniqueValues.length > 0 ? uniqueValues : undefined;
  }

  private normalizeOptionalString(value?: string | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : undefined;
  }
}
