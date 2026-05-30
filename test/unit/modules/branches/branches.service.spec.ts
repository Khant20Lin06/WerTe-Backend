import {
  BranchStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
  ZoneStatus,
} from '@prisma/client';

import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchesRepository } from '../../../../src/modules/branches/repositories/branches.repository';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';

describe('BranchesService', () => {
  const makeBranch = (
    overrides?: Partial<BranchOwnershipRecord>,
  ): BranchOwnershipRecord => ({
    id: 'br_1',
    merchantId: 'merch_1',
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
      id: 'merch_1',
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
    ...overrides,
  });

  it('builds branch ownership with merchant and zone context', () => {
    const repository = {} as BranchesRepository;
    const service = new BranchesService(repository);

    const ownership = service.buildOwnership(makeBranch());

    expect(ownership).toEqual({
      branchId: 'br_1',
      merchantId: 'merch_1',
      merchantUserId: 'usr_merchant_1',
      merchantName: 'Tea House',
      merchantStoreType: 'restaurant',
      merchantStatus: MerchantStatus.ACTIVE,
      phone: '0999999999',
      role: UserRole.MERCHANT,
      userStatus: UserStatus.ACTIVE,
      name: 'Downtown Branch',
      township: 'Botahtaung',
      storeType: 'restaurant',
      status: BranchStatus.ACTIVE,
      zones: [
        {
          zoneId: 'zone_1',
          code: 'YGN-DT',
          name: 'Downtown',
          status: ZoneStatus.ACTIVE,
        },
      ],
    });
  });

  it('returns null when the branch does not belong to the merchant user', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(makeBranch()),
    } as unknown as BranchesRepository;
    const service = new BranchesService(repository);

    const branch = await service.findOwnedByUserId('usr_merchant_2', 'br_1');

    expect(branch).toBeNull();
  });
});
