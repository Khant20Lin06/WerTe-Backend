import { UserRole, UserStatus } from '@prisma/client';

import { hasMerchantCatalogAccess } from '../../../../src/modules/menus/policies/menu-catalog-access-policy.helper';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('menu-catalog-access-policy helper', () => {
  it('allows merchant catalog access when role, owner, and merchant scope match', () => {
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
      hasMerchantCatalogAccess({
        currentUser,
        ownerUserId: 'usr_merchant_1',
        merchantId: 'merchant_1',
      }),
    ).toBe(true);
  });

  it('denies merchant catalog access when the merchant scope mismatches', () => {
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
      hasMerchantCatalogAccess({
        currentUser,
        ownerUserId: 'usr_merchant_1',
        merchantId: 'merchant_1',
      }),
    ).toBe(false);
  });
});
