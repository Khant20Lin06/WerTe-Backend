import { UserRole, UserStatus } from '@prisma/client';

import { MenuItemPolicyService } from '../../../../src/modules/menus/policies/menu-item-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  makeMenuCategoryOwnershipRecord,
  makeMenuItemOwnershipRecord,
} from './helpers/menu-catalog-policy.fixture';

describe('MenuItemPolicyService', () => {
  const service = new MenuItemPolicyService();

  it('allows the owning merchant to use a category in the same merchant scope', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0999999999',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });

    expect(service.canUseCategory(currentUser, makeMenuCategoryOwnershipRecord())).toBe(
      true,
    );
  });

  it('denies item management outside the merchant scope', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0999999999',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_2',
      },
    });

    expect(service.canManageItem(currentUser, makeMenuItemOwnershipRecord())).toBe(
      false,
    );
  });
});
