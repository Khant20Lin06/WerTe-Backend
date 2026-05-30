import {
  BranchStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
  ZoneStatus,
} from '@prisma/client';

import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchPolicyService } from '../../../../src/modules/branches/policies/branch-policy.service';
import { MerchantOwnershipRecord } from '../../../../src/modules/merchants/entities/merchant-ownership.entity';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';

describe('BranchPolicyService', () => {
  const service = new BranchPolicyService();

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

  const branch: BranchOwnershipRecord = {
    id: 'branch_1',
    merchantId: 'merchant_1',
    name: 'Downtown Branch',
    contactPhone: '0942000000',
    line1: 'No. 10, Merchant Street',
    township: 'Botahtaung',
    latitude: new Prisma.Decimal('16.7792'),
    longitude: new Prisma.Decimal('96.1735'),
    storeType: 'restaurant',
    primaryStoreTypeId: 'store_type_restaurant',
    status: BranchStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    merchant: {
      id: 'merchant_1',
      userId: 'usr_merchant_1',
      name: 'Tea House',
      storeType: 'restaurant',
      status: MerchantStatus.ACTIVE,
      user: {
        id: 'usr_merchant_1',
        phone: '0999999999',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
      },
    },
    branchZones: [
      {
        zoneId: 'zone_1',
        zone: {
          id: 'zone_1',
          code: 'YGN-DT',
          name: 'Downtown',
          status: ZoneStatus.ACTIVE,
        },
      },
    ],
  };

  it('allows the owning merchant user to manage merchant context', () => {
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

    expect(service.canManageMerchant(currentUser, merchant)).toBe(true);
  });

  it('denies managing a branch outside the merchant scope', () => {
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

    expect(service.canManageBranch(currentUser, branch)).toBe(false);
  });
});
