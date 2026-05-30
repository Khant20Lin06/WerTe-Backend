import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { hasMerchantCatalogAccess } from './menu-catalog-access-policy.helper';

@Injectable()
export class MenuItemPolicyService {
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

  canUseCategory(
    currentUser: AuthenticatedUserEntity,
    category: MenuCategoryOwnershipRecord,
  ): boolean {
    return hasMerchantCatalogAccess({
      currentUser,
      ownerUserId: category.branch.merchant.user.id,
      merchantId: category.branch.merchant.id,
    });
  }

  canManageItem(
    currentUser: AuthenticatedUserEntity,
    item: MenuItemOwnershipRecord,
  ): boolean {
    return hasMerchantCatalogAccess({
      currentUser,
      ownerUserId: item.branch.merchant.user.id,
      merchantId: item.branch.merchant.id,
    });
  }
}
