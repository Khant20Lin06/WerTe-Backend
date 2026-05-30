import { UserRole, UserStatus } from '@prisma/client';

import { MenuOptionGroupPolicyService } from '../../../../src/modules/menus/policies/menu-option-group-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  makeItemOptionGroupOwnershipRecord,
  makeMenuItemOwnershipRecord,
} from './helpers/menu-catalog-policy.fixture';

describe('MenuOptionGroupPolicyService', () => {
  const service = new MenuOptionGroupPolicyService();

  it('allows the owning merchant to manage option groups for an owned item', () => {
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

    expect(service.canManageItem(currentUser, makeMenuItemOwnershipRecord())).toBe(
      true,
    );
  });

  it('denies option-group management outside the merchant scope', () => {
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
      service.canManageOptionGroup(currentUser, makeItemOptionGroupOwnershipRecord()),
    ).toBe(false);
  });
});
