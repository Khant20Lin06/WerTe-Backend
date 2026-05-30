import { UserRole, UserStatus } from '@prisma/client';

import { MenuOptionPolicyService } from '../../../../src/modules/menus/policies/menu-option-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  makeItemOptionGroupOwnershipRecord,
  makeItemOptionOwnershipRecord,
} from './helpers/menu-catalog-policy.fixture';

describe('MenuOptionPolicyService', () => {
  const service = new MenuOptionPolicyService();

  it('allows the owning merchant to manage options for an owned option group', () => {
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

    expect(
      service.canManageOptionGroup(currentUser, makeItemOptionGroupOwnershipRecord()),
    ).toBe(true);
  });

  it('denies option management outside the merchant scope', () => {
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

    expect(service.canManageOption(currentUser, makeItemOptionOwnershipRecord())).toBe(
      false,
    );
  });
});
