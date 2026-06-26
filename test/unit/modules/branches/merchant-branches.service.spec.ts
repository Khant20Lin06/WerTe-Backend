import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  MerchantStatus,
  Prisma,
  UserRole,
  UserStatus,
  ZoneStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../../../src/modules/branches/entities/branch-ownership.entity';
import { BranchPolicyService } from '../../../../src/modules/branches/policies/branch-policy.service';
import { BranchesRepository } from '../../../../src/modules/branches/repositories/branches.repository';
import { BranchesService } from '../../../../src/modules/branches/services/branches.service';
import { MerchantBranchesService } from '../../../../src/modules/branches/services/merchant-branches.service';
import { MerchantOwnershipRecord } from '../../../../src/modules/merchants/entities/merchant-ownership.entity';
import { MerchantAccountService } from '../../../../src/modules/merchants/services/merchant-account.service';
import { ZonesService } from '../../../../src/modules/zones/services/zones.service';

describe('MerchantBranchesService', () => {
  const currentUser: AuthenticatedUserEntity = {
    userId: 'usr_merchant_1',
    sessionId: 'session_1',
    role: UserRole.MERCHANT,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_merchant_1',
      phone: '0999999999',
      role: UserRole.MERCHANT,
      status: UserStatus.ACTIVE,
      merchantId: 'merchant_1',
    },
  };

  const merchantRecord: MerchantOwnershipRecord = {
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

  const makeBranch = (
    overrides?: Partial<BranchOwnershipRecord>,
  ): BranchOwnershipRecord => ({
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
    operatingHours: null,
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
    staffAssignments: [],
    ...overrides,
  });

  const prismaService = {
    runInTransaction: jest.fn(async (callback: (tx: object) => Promise<unknown>) =>
      callback({}),
    ),
  } as unknown as PrismaService;

  it('creates a branch and assigns validated zones', async () => {
    const branchesRepository = {
      create: jest.fn().mockResolvedValue(makeBranch()),
      assignZones: jest.fn().mockResolvedValue({ count: 1 }),
      findById: jest.fn().mockResolvedValue(makeBranch()),
    } as unknown as BranchesRepository;
    const service = new MerchantBranchesService(
      prismaService,
      {
        resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
      } as unknown as MerchantAccountService,
      branchesRepository,
      {
        listByMerchantId: jest.fn().mockResolvedValue([]),
        invalidateCache: jest.fn().mockResolvedValue(undefined),
      } as unknown as BranchesService,
      new BranchPolicyService(),
      {
        listByIds: jest.fn().mockResolvedValue([
          {
            id: 'zone_1',
            code: 'YGN-DT',
            name: 'Downtown',
            description: null,
            status: ZoneStatus.ACTIVE,
            createdAt: new Date('2026-04-19T00:00:00.000Z'),
            updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          },
        ]),
      } as unknown as ZonesService,
    );

    const result = await service.createCurrentMerchantBranch(currentUser, {
      name: 'Downtown Branch',
      township: 'Botahtaung',
      zoneIds: ['zone_1'],
    });

    expect(branchesRepository.assignZones).toHaveBeenCalledWith(
      'branch_1',
      ['zone_1'],
      expect.anything(),
    );
    expect(branchesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storeType: 'restaurant',
      }),
      expect.anything(),
    );
    expect(result.id).toBe('branch_1');
    expect(result.storeType).toBe('restaurant');
    expect(result.zones).toHaveLength(1);
  });

  it('allows a branch to override the merchant store type', async () => {
    const branchesRepository = {
      create: jest.fn().mockResolvedValue(
        makeBranch({
          storeType: 'grocery',
        }),
      ),
      assignZones: jest.fn().mockResolvedValue({ count: 0 }),
      findById: jest.fn().mockResolvedValue(
        makeBranch({
          storeType: 'grocery',
        }),
      ),
    } as unknown as BranchesRepository;
    const service = new MerchantBranchesService(
      prismaService,
      {
        resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
      } as unknown as MerchantAccountService,
      branchesRepository,
      {
        listByMerchantId: jest.fn().mockResolvedValue([]),
        invalidateCache: jest.fn().mockResolvedValue(undefined),
      } as unknown as BranchesService,
      new BranchPolicyService(),
      {
        listByIds: jest.fn().mockResolvedValue([]),
      } as unknown as ZonesService,
    );

    const result = await service.createCurrentMerchantBranch(currentUser, {
      name: 'Grocery Branch',
      township: 'Botahtaung',
      storeType: 'grocery',
    });

    expect(branchesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storeType: 'grocery',
      }),
      expect.anything(),
    );
    expect(result.storeType).toBe('grocery');
  });

  it('rejects inactive zones during branch creation', async () => {
    const service = new MerchantBranchesService(
      prismaService,
      {
        resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
      } as unknown as MerchantAccountService,
      {} as BranchesRepository,
      {
        listByMerchantId: jest.fn().mockResolvedValue([]),
        invalidateCache: jest.fn().mockResolvedValue(undefined),
      } as unknown as BranchesService,
      new BranchPolicyService(),
      {
        listByIds: jest.fn().mockResolvedValue([
          {
            id: 'zone_2',
            code: 'YGN-OLD',
            name: 'Old Zone',
            description: null,
            status: ZoneStatus.INACTIVE,
            createdAt: new Date('2026-04-19T00:00:00.000Z'),
            updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          },
        ]),
      } as unknown as ZonesService,
    );

    await expect(
      service.createCurrentMerchantBranch(currentUser, {
        name: 'Downtown Branch',
        township: 'Botahtaung',
        zoneIds: ['zone_2'],
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      response: expect.objectContaining({
        code: ErrorCodes.unprocessableEntity,
      }),
    });
  });

  it('replaces branch zone assignments during update when zone ids are provided', async () => {
    const branchesRepository = {
      findById: jest.fn().mockResolvedValue(makeBranch()),
      update: jest.fn().mockResolvedValue(makeBranch()),
      clearZoneAssignments: jest.fn().mockResolvedValue({ count: 1 }),
      assignZones: jest.fn().mockResolvedValue({ count: 1 }),
    } as unknown as BranchesRepository;
    const service = new MerchantBranchesService(
      prismaService,
      {
        resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
      } as unknown as MerchantAccountService,
      branchesRepository,
      {
        listByMerchantId: jest.fn().mockResolvedValue([]),
        invalidateCache: jest.fn().mockResolvedValue(undefined),
      } as unknown as BranchesService,
      new BranchPolicyService(),
      {
        listByIds: jest.fn().mockResolvedValue([
          {
            id: 'zone_1',
            code: 'YGN-DT',
            name: 'Downtown',
            description: null,
            status: ZoneStatus.ACTIVE,
            createdAt: new Date('2026-04-19T00:00:00.000Z'),
            updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          },
        ]),
      } as unknown as ZonesService,
    );

    await service.updateCurrentMerchantBranch(currentUser, 'branch_1', {
      zoneIds: ['zone_1'],
      name: 'Downtown Branch Updated',
    });

    expect(branchesRepository.clearZoneAssignments).toHaveBeenCalledWith(
      'branch_1',
      expect.anything(),
    );
    expect(branchesRepository.assignZones).toHaveBeenCalledWith(
      'branch_1',
      ['zone_1'],
      expect.anything(),
    );
  });
});
