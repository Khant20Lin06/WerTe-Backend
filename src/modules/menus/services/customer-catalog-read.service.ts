import { HttpStatus, Injectable } from '@nestjs/common';
import { BranchStatus, MerchantStatus } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenusService } from './menus.service';

@Injectable()
export class CustomerCatalogReadService {
  constructor(private readonly menusService: MenusService) {}

  async getVisibleBranchCatalog(
    branchId: string,
    options?: {
      storeTypeCode?: string;
    },
  ): Promise<BranchCatalogEntity | null> {
    const branchCatalog = await this.menusService.findBranchCatalogByBranchId(branchId);
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

    return this.menusService.buildBranchCatalog(branchCatalog, {
      activeOnly: true,
      storeTypeCode,
    });
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
