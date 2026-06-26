"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const branch_policy_service_1 = require("../../../../src/modules/branches/policies/branch-policy.service");
const merchant_branches_service_1 = require("../../../../src/modules/branches/services/merchant-branches.service");
describe('MerchantBranchesService', () => {
    const currentUser = {
        userId: 'usr_merchant_1',
        sessionId: 'session_1',
        role: client_1.UserRole.MERCHANT,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
            merchantId: 'merchant_1',
        },
    };
    const merchantRecord = {
        id: 'merchant_1',
        userId: 'usr_merchant_1',
        name: 'Tea House',
        supportPhone: '0942000000',
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        status: client_1.MerchantStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        user: {
            id: 'usr_merchant_1',
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            status: client_1.UserStatus.ACTIVE,
        },
    };
    const makeBranch = (overrides) => ({
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        contactPhone: '0942000000',
        line1: 'No. 10, Merchant Street',
        township: 'Botahtaung',
        latitude: new client_1.Prisma.Decimal('16.7792'),
        longitude: new client_1.Prisma.Decimal('96.1735'),
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        status: client_1.BranchStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        merchant: {
            id: 'merchant_1',
            userId: 'usr_merchant_1',
            name: 'Tea House',
            storeType: 'restaurant',
            status: client_1.MerchantStatus.ACTIVE,
            user: {
                id: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
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
                    status: client_1.ZoneStatus.ACTIVE,
                },
            },
        ],
        staffAssignments: [],
        ...overrides,
    });
    const prismaService = {
        runInTransaction: jest.fn(async (callback) => callback({})),
    };
    it('creates a branch and assigns validated zones', async () => {
        const branchesRepository = {
            create: jest.fn().mockResolvedValue(makeBranch()),
            assignZones: jest.fn().mockResolvedValue({ count: 1 }),
            findById: jest.fn().mockResolvedValue(makeBranch()),
        };
        const service = new merchant_branches_service_1.MerchantBranchesService(prismaService, {
            resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
        }, branchesRepository, {
            listByMerchantId: jest.fn().mockResolvedValue([]),
            invalidateCache: jest.fn().mockResolvedValue(undefined),
        }, new branch_policy_service_1.BranchPolicyService(), {
            listByIds: jest.fn().mockResolvedValue([
                {
                    id: 'zone_1',
                    code: 'YGN-DT',
                    name: 'Downtown',
                    description: null,
                    status: client_1.ZoneStatus.ACTIVE,
                    createdAt: new Date('2026-04-19T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                },
            ]),
        });
        const result = await service.createCurrentMerchantBranch(currentUser, {
            name: 'Downtown Branch',
            township: 'Botahtaung',
            zoneIds: ['zone_1'],
        });
        expect(branchesRepository.assignZones).toHaveBeenCalledWith('branch_1', ['zone_1'], expect.anything());
        expect(branchesRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            storeType: 'restaurant',
        }), expect.anything());
        expect(result.id).toBe('branch_1');
        expect(result.storeType).toBe('restaurant');
        expect(result.zones).toHaveLength(1);
    });
    it('allows a branch to override the merchant store type', async () => {
        const branchesRepository = {
            create: jest.fn().mockResolvedValue(makeBranch({
                storeType: 'grocery',
            })),
            assignZones: jest.fn().mockResolvedValue({ count: 0 }),
            findById: jest.fn().mockResolvedValue(makeBranch({
                storeType: 'grocery',
            })),
        };
        const service = new merchant_branches_service_1.MerchantBranchesService(prismaService, {
            resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
        }, branchesRepository, {
            listByMerchantId: jest.fn().mockResolvedValue([]),
            invalidateCache: jest.fn().mockResolvedValue(undefined),
        }, new branch_policy_service_1.BranchPolicyService(), {
            listByIds: jest.fn().mockResolvedValue([]),
        });
        const result = await service.createCurrentMerchantBranch(currentUser, {
            name: 'Grocery Branch',
            township: 'Botahtaung',
            storeType: 'grocery',
        });
        expect(branchesRepository.create).toHaveBeenCalledWith(expect.objectContaining({
            storeType: 'grocery',
        }), expect.anything());
        expect(result.storeType).toBe('grocery');
    });
    it('rejects inactive zones during branch creation', async () => {
        const service = new merchant_branches_service_1.MerchantBranchesService(prismaService, {
            resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
        }, {}, {
            listByMerchantId: jest.fn().mockResolvedValue([]),
            invalidateCache: jest.fn().mockResolvedValue(undefined),
        }, new branch_policy_service_1.BranchPolicyService(), {
            listByIds: jest.fn().mockResolvedValue([
                {
                    id: 'zone_2',
                    code: 'YGN-OLD',
                    name: 'Old Zone',
                    description: null,
                    status: client_1.ZoneStatus.INACTIVE,
                    createdAt: new Date('2026-04-19T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                },
            ]),
        });
        await expect(service.createCurrentMerchantBranch(currentUser, {
            name: 'Downtown Branch',
            township: 'Botahtaung',
            zoneIds: ['zone_2'],
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('replaces branch zone assignments during update when zone ids are provided', async () => {
        const branchesRepository = {
            findById: jest.fn().mockResolvedValue(makeBranch()),
            update: jest.fn().mockResolvedValue(makeBranch()),
            clearZoneAssignments: jest.fn().mockResolvedValue({ count: 1 }),
            assignZones: jest.fn().mockResolvedValue({ count: 1 }),
        };
        const service = new merchant_branches_service_1.MerchantBranchesService(prismaService, {
            resolveOwnedMerchant: jest.fn().mockResolvedValue(merchantRecord),
        }, branchesRepository, {
            listByMerchantId: jest.fn().mockResolvedValue([]),
            invalidateCache: jest.fn().mockResolvedValue(undefined),
        }, new branch_policy_service_1.BranchPolicyService(), {
            listByIds: jest.fn().mockResolvedValue([
                {
                    id: 'zone_1',
                    code: 'YGN-DT',
                    name: 'Downtown',
                    description: null,
                    status: client_1.ZoneStatus.ACTIVE,
                    createdAt: new Date('2026-04-19T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                },
            ]),
        });
        await service.updateCurrentMerchantBranch(currentUser, 'branch_1', {
            zoneIds: ['zone_1'],
            name: 'Downtown Branch Updated',
        });
        expect(branchesRepository.clearZoneAssignments).toHaveBeenCalledWith('branch_1', expect.anything());
        expect(branchesRepository.assignZones).toHaveBeenCalledWith('branch_1', ['zone_1'], expect.anything());
    });
});
//# sourceMappingURL=merchant-branches.service.spec.js.map