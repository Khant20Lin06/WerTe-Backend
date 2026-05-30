import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
import { hasMerchantCatalogAccess } from './menu-catalog-access-policy.helper';

@Injectable()
export class MenuOptionPolicyService {
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

  canManageOption(
    currentUser: AuthenticatedUserEntity,
    option: ItemOptionOwnershipRecord,
  ): boolean {
    return hasMerchantCatalogAccess({
      currentUser,
      ownerUserId: option.group.menuItem.branch.merchant.user.id,
      merchantId: option.group.menuItem.branch.merchant.id,
    });
  }
}
