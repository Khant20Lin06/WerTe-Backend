import { HttpStatus, Injectable } from '@nestjs/common';
import { BranchStatus, MerchantStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { RatingsService } from '../../ratings/ratings.service';
import {
  BranchCatalogEntity,
  CatalogMenuItemEntity,
} from '../entities/branch-catalog.entity';
import { MenuCacheService } from './menu-cache.service';
import { MenusService } from './menus.service';

@Injectable()
export class CustomerCatalogReadService {
  constructor(
    private readonly menusService: MenusService,
    private readonly menuCache: MenuCacheService,
    private readonly ratingsService: RatingsService,
  ) {}

  async getVisibleBranchCatalog(
    branchId: string,
    options?: {
      storeTypeCode?: string;
    },
  ): Promise<BranchCatalogEntity | null> {
    let branchCatalog = await this.menuCache.getCatalog(branchId);
    if (branchCatalog === null) {
      branchCatalog = await this.menusService.findBranchCatalogByBranchId(branchId);
      if (branchCatalog !== null) {
        void this.menuCache.setCatalog(branchId, branchCatalog);
      }
    }
    if (branchCatalog === null) {
      return null;
    }

    if (
      branchCatalog.status !== BranchStatus.ACTIVE ||
      branchCatalog.merchant.status !== MerchantStatus.ACTIVE
    ) {
      return null;
    }

    const storeTypeCode = this.normalizeOptionalString(options?.storeTypeCode);

    if (
      storeTypeCode !== undefined &&
      !branchCatalog.storeTypes.some(
        (assignment) =>
          assignment.storeType.code.toLowerCase() === storeTypeCode,
      )
    ) {
      return null;
    }

    const catalog = this.menusService.buildBranchCatalog(branchCatalog, {
      activeOnly: true,
      storeTypeCode,
    });

    await this.enrichWithRatings(catalog);

    return catalog;
  }

  /**
   * Attach per-menu-item rating average + count. Done after the cached catalog
   * is built (not inside the cached entity) so ratings are always fresh and a
   * new rating is reflected without busting the menu cache.
   */
  private async enrichWithRatings(catalog: BranchCatalogEntity): Promise<void> {
    const items: CatalogMenuItemEntity[] = [
      ...catalog.categories.flatMap((category) => category.items),
      ...catalog.uncategorizedItems,
    ];
    if (items.length === 0) return;

    const ratings = await this.ratingsService.getMenuItemRatings(
      items.map((item) => item.itemId),
    );

    for (const item of items) {
      const rating = ratings.get(item.itemId);
      // Always set both fields: catalogs deserialized from a cache entry
      // written before these fields existed would otherwise leave them
      // undefined.
      if (rating !== undefined && rating.count > 0) {
        item.averageRating = Math.round(rating.average * 10) / 10;
        item.reviewCount = rating.count;
      } else {
        item.averageRating = null;
        item.reviewCount = 0;
      }
    }
  }

  async getVisibleBranchCatalogOrThrow(
    branchId: string,
    options?: {
      storeTypeCode?: string;
    },
  ): Promise<BranchCatalogEntity> {
    const branchCatalog = await this.getVisibleBranchCatalog(branchId, options);

    if (branchCatalog === null) {
      throw new AppException(
        'Customer-visible branch catalog was not found.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return branchCatalog;
  }

  private normalizeOptionalString(value?: string | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalizedValue = value.trim().toLowerCase();

    return normalizedValue.length > 0 ? normalizedValue : undefined;
  }
}
