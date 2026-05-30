import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { hasMerchantCatalogAccess } from './menu-catalog-access-policy.helper';

@Injectable()
export class MenuCategoryPolicyService {
  canManageBranchCatalog(
    currentUser: AuthenticatedUserEntity,
    branch: BranchOwnershipRecord,
  ): boolean {
    return hasMerchantCatalogAccess({
      currentUser,
      ownerUserId: branch.merchant.user.id,
      merchantId: branch.merchant.id,
    });
  }

  canManageCategory(
    currentUser: AuthenticatedUserEntity,
    category: MenuCategoryOwnershipRecord,
  ): boolean {
    return hasMerchantCatalogAccess({
      currentUser,
      ownerUserId: category.branch.merchant.user.id,
      merchantId: category.branch.merchant.id,
    });
  }
}
