import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { toMerchantMenuScopeOverviewDto } from '../dto/merchant-menu-scope-overview.dto';
import { BranchCatalogEntity } from '../entities/branch-catalog.entity';
import { MenusService } from './menus.service';

@Injectable()
export class MerchantCatalogReadService {
  constructor(private readonly menusService: MenusService) {}

  async getOwnedBranchCatalog(
    userId: string,
    branchId: string,
  ): Promise<BranchCatalogEntity | null> {
    const branchCatalog = await this.menusService.findOwnedBranchCatalogByUserId(
      userId,
      branchId,
    );

    if (branchCatalog === null) {
      return null;
    }

    return this.menusService.buildBranchCatalog(branchCatalog);
  }

  async getOwnedBranchScopeOverview(userId: string, branchId: string) {
    const branchCatalog = await this.getOwnedBranchCatalog(userId, branchId);

    if (branchCatalog === null) {
      throw new AppException(
        'Branch catalog was not found for the requested merchant user.',
        HttpStatus.NOT_FOUND,
        {
          code: ErrorCodes.notFound,
        },
      );
    }

    return toMerchantMenuScopeOverviewDto(branchCatalog);
  }
}
