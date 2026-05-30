import { HttpStatus } from '@nestjs/common';
import {
  BranchStatus,
  BranchStoreTypeStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { PrismaService } from '../../../../src/infrastructure/database/prisma.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { BranchStoreTypeManagementRecord } from '../../../../src/modules/store-types/entities/branch-store-type-management.entity';
import { StoreTypeManagementRecord } from '../../../../src/modules/store-types/entities/store-type-management.entity';
import {
  BranchSummaryRecord,
  StoreTypesRepository,
} from '../../../../src/modules/store-types/repositories/store-types.repository';
import { MerchantStoreTypeRequestService } from '../../../../src/modules/store-types/services/merchant-store-type-request.service';
import { StoreTypePolicyService } from '../../../../src/modules/store-types/policies/store-type-policy.service';

describe('MerchantStoreTypeRequestService', () => {
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

  const makeBranchSummary = (
    overrides?: Partial<BranchSummaryRecord>,
  ): BranchSummaryRecord => ({
    id: 'branch_1',
    merchantId: 'merchant_1',
    name: 'Downtown Branch',
    status: BranchStatus.ACTIVE,
    storeType: 'restaurant',
    primaryStoreTypeId: null,
    merchant: {
      id: 'merchant_1',
      userId: 'usr_merchant_1',
      name: 'Tea House',
      storeType: 'restaurant',
      primaryStoreTypeId: null,
    },
    ...overrides,
  });

  const makeStoreType = (
    overrides?: Partial<StoreTypeManagementRecord>,
  ): StoreTypeManagementRecord => ({
    id: 'store_type_grocery',
    code: 'grocery',
    name: 'Grocery',
    description: 'Retail grocery storefronts.',
    iconUrl: null,
    isActive: true,
    isSystem: false,
    sortOrder: 10,
    createdAt: new Date('2026-04-30T00:00:00.000Z'),
    updatedAt: new Date('2026-04-30T00:00:00.000Z'),
    deletedAt: null,
    _count: {
      branchAssignments: 0,
      branchPrimaries: 0,
      merchantPrimaries: 0,
    },
    ...overrides,
  });

  const makeAssignment = (
    overrides?: Partial<BranchStoreTypeManagementRecord>,
  ): BranchStoreTypeManagementRecord => ({
    branchId: 'branch_1',
    storeTypeId: 'store_type_grocery',
    status: BranchStoreTypeStatus.PENDING,
    isPrimary: false,
    sortOrder: 10,
    requestedByUserId: 'usr_merchant_1',
    approvedByUserId: null,
    approvedAt: null,
    rejectedAt: null,
    hiddenAt: null,
    reason: 'Launching grocery next week.',
    createdAt: new Date('2026-04-30T01:00:00.000Z'),
    updatedAt: new Date('2026-04-30T01:00:00.000Z'),
    branch: {
      id: 'branch_1',
      name: 'Downtown Branch',
      status: BranchStatus.ACTIVE,
      storeType: 'restaurant',
      primaryStoreTypeId: null,
      merchant: {
        id: 'merchant_1',
        name: 'Tea House',
      },
    },
    storeType: {
      id: 'store_type_grocery',
      code: 'grocery',
      name: 'Grocery',
      isActive: true,
      isSystem: false,
      deletedAt: null,
    },
    requestedBy: {
      id: 'usr_merchant_1',
      role: UserRole.MERCHANT,
    },
    approvedBy: null,
    ...overrides,
  });

  const makePrismaService = () =>
    ({
      runInTransaction: jest.fn(
        async (callback: (tx: object) => Promise<unknown>) => callback({}),
      ),
    }) as unknown as PrismaService;

  const makeAuditService = () =>
    ({
      logAction: jest.fn().mockResolvedValue(undefined),
    }) as unknown as jest.Mocked<AuditService>;

  it('lists active store types available to merchants', async () => {
    const service = new MerchantStoreTypeRequestService(
      makePrismaService(),
      {
        listActiveStoreTypes: jest.fn().mockResolvedValue([makeStoreType()]),
      } as unknown as StoreTypesRepository,
      new StoreTypePolicyService(),
      makeAuditService(),
    );

    await expect(service.listAvailableStoreTypes(currentUser)).resolves.toEqual([
      {
        id: 'store_type_grocery',
        code: 'grocery',
        name: 'Grocery',
        description: 'Retail grocery storefronts.',
        iconUrl: null,
        sortOrder: 10,
      },
    ]);
  });

  it('creates a pending request for an owned branch and logs the audit event', async () => {
    const auditService = makeAuditService();
    const storeTypesRepository = {
      findBranchSummaryById: jest.fn().mockResolvedValue(makeBranchSummary()),
      findStoreTypeById: jest.fn().mockResolvedValue(makeStoreType()),
      findBranchStoreType: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(makeAssignment()),
      createBranchStoreType: jest.fn().mockResolvedValue(makeAssignment()),
    } as unknown as jest.Mocked<StoreTypesRepository>;
    const service = new MerchantStoreTypeRequestService(
      makePrismaService(),
      storeTypesRepository,
      new StoreTypePolicyService(),
      auditService,
    );

    const result = await service.requestCurrentMerchantBranchStoreType(
      currentUser,
      'branch_1',
      {
        storeTypeId: 'store_type_grocery',
        sortOrder: 10,
        reason: 'Launching grocery next week.',
      },
    );

    expect(storeTypesRepository.createBranchStoreType).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch_1',
        storeTypeId: 'store_type_grocery',
        status: BranchStoreTypeStatus.PENDING,
        requestedByUserId: 'usr_merchant_1',
      }),
      expect.anything(),
    );
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'branch_store_types.requested',
        branchId: 'branch_1',
      }),
    );
    expect(result.status).toBe(BranchStoreTypeStatus.PENDING);
  });

  it('rejects requests for branches owned by another merchant', async () => {
    const service = new MerchantStoreTypeRequestService(
      makePrismaService(),
      {
        findBranchSummaryById: jest.fn().mockResolvedValue(
          makeBranchSummary({
            merchant: {
              id: 'merchant_2',
              userId: 'usr_merchant_2',
              name: 'Other Merchant',
              storeType: 'restaurant',
              primaryStoreTypeId: null,
            },
          }),
        ),
      } as unknown as StoreTypesRepository,
      new StoreTypePolicyService(),
      makeAuditService(),
    );

    await expect(
      service.listCurrentMerchantBranchStoreTypes(currentUser, 'branch_1'),
    ).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
      response: expect.objectContaining({
        code: ErrorCodes.forbidden,
      }),
    });
  });

  it('rejects re-requesting store types that are already approved', async () => {
    const service = new MerchantStoreTypeRequestService(
      makePrismaService(),
      {
        findBranchSummaryById: jest.fn().mockResolvedValue(makeBranchSummary()),
        findStoreTypeById: jest.fn().mockResolvedValue(makeStoreType()),
        findBranchStoreType: jest.fn().mockResolvedValue(
          makeAssignment({
            status: BranchStoreTypeStatus.APPROVED,
            approvedByUserId: 'usr_admin_1',
            approvedAt: new Date('2026-04-30T02:00:00.000Z'),
          }),
        ),
      } as unknown as StoreTypesRepository,
      new StoreTypePolicyService(),
      makeAuditService(),
    );

    await expect(
      service.requestCurrentMerchantBranchStoreType(currentUser, 'branch_1', {
        storeTypeId: 'store_type_grocery',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
      }),
    });
  });
});
