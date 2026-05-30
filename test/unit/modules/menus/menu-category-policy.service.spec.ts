import { UserRole, UserStatus } from '@prisma/client';

import { MenuCategoryPolicyService } from '../../../../src/modules/menus/policies/menu-category-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  makeBranchOwnershipRecord,
  makeMenuCategoryOwnershipRecord,
} from './helpers/menu-catalog-policy.fixture';

describe('MenuCategoryPolicyService', () => {
  const service = new MenuCategoryPolicyService();

  it('allows the owning merchant to manage a branch catalog', () => {
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

    expect(service.canManageBranchCatalog(currentUser, makeBranchOwnershipRecord())).toBe(
      true,
    );
  });

  it('denies category management outside the merchant scope', () => {
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

    expect(
      service.canManageCategory(currentUser, makeMenuCategoryOwnershipRecord()),
    ).toBe(false);
  });
});
