import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
import { hasMerchantCatalogAccess } from './menu-catalog-access-policy.helper';

@Injectable()
export class MenuOptionGroupPolicyService {
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

  canManageOptionGroup(
    currentUser: AuthenticatedUserEntity,
    optionGroup: ItemOptionGroupOwnershipRecord,
  ): boolean {
    return hasMerchantCatalogAccess({
      currentUser,
      ownerUserId: optionGroup.menuItem.branch.merchant.user.id,
      merchantId: optionGroup.menuItem.branch.merchant.id,
    });
  }
}
