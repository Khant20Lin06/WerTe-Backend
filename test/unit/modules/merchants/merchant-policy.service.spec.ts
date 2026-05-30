import { MerchantStatus, UserRole, UserStatus } from '@prisma/client';

import { MerchantOwnershipRecord } from '../../../../src/modules/merchants/entities/merchant-ownership.entity';
import { MerchantPolicyService } from '../../../../src/modules/merchants/policies/merchant-policy.service';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('MerchantPolicyService', () => {
  const service = new MerchantPolicyService();

  const merchant: MerchantOwnershipRecord = {
    id: 'merchant_1',
    userId: 'usr_merchant_1',
    name: 'Tea House',
    supportPhone: '0942000000',
    storeType: 'restaurant',
    primaryStoreTypeId: 'store_type_restaurant',
    status: MerchantStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    user: {
      id: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
    },
  };

  it('allows the owning merchant user to access the merchant profile', () => {
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

    expect(service.canAccessMerchant(currentUser, merchant)).toBe(true);
  });

  it('denies access when the merchant scope mismatches', () => {
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

    expect(service.canAccessMerchant(currentUser, merchant)).toBe(false);
  });
});
