"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const store_type_policy_service_1 = require("../../../../src/modules/store-types/policies/store-type-policy.service");
const store_type_management_service_1 = require("../../../../src/modules/store-types/services/store-type-management.service");
describe('StoreTypeManagementService', () => {
    const currentUser = {
        userId: 'usr_admin_1',
        sessionId: 'session_1',
        role: client_1.UserRole.ADMIN,
        tokenType: 'access',
        actorContext: {
            userId: 'usr_admin_1',
            phone: '09111111111',
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    };
    const makeStoreType = (overrides) => ({
        id: 'store_type_restaurant',
        code: 'restaurant',
        name: 'Restaurant',
        description: 'Prepared food and beverage merchants.',
        iconUrl: null,
        isActive: true,
        isSystem: false,
        sortOrder: 0,
        createdAt: new Date('2026-04-30T00:00:00.000Z'),
        updatedAt: new Date('2026-04-30T00:00:00.000Z'),
        deletedAt: null,
        _count: {
            branchAssignments: 1,
            branchPrimaries: 1,
            merchantPrimaries: 1,
        },
        ...overrides,
    });
    const makeBranchSummary = (overrides) => ({
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        status: client_1.BranchStatus.ACTIVE,
        storeType: 'restaurant',
        primaryStoreTypeId: 'store_type_restaurant',
        merchant: {
            id: 'merchant_1',
            userId: 'usr_merchant_1',
            name: 'Tea House',
            storeType: 'restaurant',
            primaryStoreTypeId: 'store_type_restaurant',
        },
        ...overrides,
    });
    const makeAssignment = (overrides) => ({
        branchId: 'branch_1',
        storeTypeId: 'store_type_grocery',
        status: client_1.BranchStoreTypeStatus.APPROVED,
        isPrimary: true,
        sortOrder: 0,
        requestedByUserId: 'usr_admin_1',
        approvedByUserId: 'usr_admin_1',
        approvedAt: new Date('2026-04-30T01:00:00.000Z'),
        rejectedAt: null,
        hiddenAt: null,
        reason: 'Approved for launch.',
        createdAt: new Date('2026-04-30T01:00:00.000Z'),
        updatedAt: new Date('2026-04-30T01:00:00.000Z'),
        branch: {
            id: 'branch_1',
            name: 'Downtown Branch',
            status: client_1.BranchStatus.ACTIVE,
            storeType: 'grocery',
            primaryStoreTypeId: 'store_type_grocery',
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
            id: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
        },
        approvedBy: {
            id: 'usr_admin_1',
            role: client_1.UserRole.ADMIN,
        },
        ...overrides,
    });
    const makePrismaService = () => ({
        runInTransaction: jest.fn(async (callback) => callback({})),
    });
    const makeAuditService = () => ({
        logAction: jest.fn().mockResolvedValue(undefined),
    });
    it('creates a store type with a normalized lowercase code', async () => {
        const auditService = makeAuditService();
        const storeTypesRepository = {
            findStoreTypeByCode: jest.fn().mockResolvedValue(null),
            createStoreType: jest.fn().mockResolvedValue(makeStoreType({
                id: 'store_type_pharmacy',
                code: 'pharmacy',
                name: 'Pharmacy',
                sortOrder: 30,
            })),
        };
        const service = new store_type_management_service_1.StoreTypeManagementService(makePrismaService(), storeTypesRepository, {
            getById: jest.fn().mockResolvedValue(null),
            setById: jest.fn().mockResolvedValue(undefined),
            getList: jest.fn().mockResolvedValue(null),
            setList: jest.fn().mockResolvedValue(undefined),
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
            invalidateOne: jest.fn().mockResolvedValue(undefined),
            invalidateAll: jest.fn().mockResolvedValue(undefined),
        }, { invalidateAll: jest.fn().mockResolvedValue(undefined) }, new store_type_policy_service_1.StoreTypePolicyService(), auditService);
        const result = await service.createStoreType(currentUser, {
            code: 'Pharmacy',
            name: 'Pharmacy',
            sortOrder: 30,
        });
        expect(storeTypesRepository.createStoreType).toHaveBeenCalledWith(expect.objectContaining({
            code: 'pharmacy',
            name: 'Pharmacy',
        }));
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'store_types.created',
            resourceId: 'store_type_pharmacy',
        }));
        expect(result.code).toBe('pharmacy');
    });
    it('rejects duplicate store type codes during create', async () => {
        const service = new store_type_management_service_1.StoreTypeManagementService(makePrismaService(), {
            findStoreTypeByCode: jest.fn().mockResolvedValue(makeStoreType()),
        }, {
            getById: jest.fn().mockResolvedValue(null),
            setById: jest.fn().mockResolvedValue(undefined),
            getList: jest.fn().mockResolvedValue(null),
            setList: jest.fn().mockResolvedValue(undefined),
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
            invalidateOne: jest.fn().mockResolvedValue(undefined),
            invalidateAll: jest.fn().mockResolvedValue(undefined),
        }, { invalidateAll: jest.fn().mockResolvedValue(undefined) }, new store_type_policy_service_1.StoreTypePolicyService(), makeAuditService());
        await expect(service.createStoreType(currentUser, {
            code: 'restaurant',
            name: 'Restaurant',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.conflict,
            }),
        });
    });
    it('assigns and syncs an approved primary branch store type', async () => {
        const prismaService = makePrismaService();
        const auditService = makeAuditService();
        const storeTypesRepository = {
            findBranchSummaryById: jest.fn().mockResolvedValue(makeBranchSummary()),
            findStoreTypeById: jest.fn().mockResolvedValue(makeStoreType({
                id: 'store_type_grocery',
                code: 'grocery',
                name: 'Grocery',
            })),
            findBranchStoreType: jest
                .fn()
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(makeAssignment()),
            createBranchStoreType: jest.fn().mockResolvedValue(makeAssignment()),
            listApprovedBranchStoreTypes: jest.fn().mockResolvedValue([makeAssignment()]),
            clearBranchPrimaryAssignments: jest.fn().mockResolvedValue({ count: 1 }),
            updateBranchStoreType: jest.fn().mockResolvedValue(makeAssignment()),
            updateBranchPrimaryStoreType: jest.fn().mockResolvedValue({}),
        };
        const service = new store_type_management_service_1.StoreTypeManagementService(prismaService, storeTypesRepository, {
            getById: jest.fn().mockResolvedValue(null),
            setById: jest.fn().mockResolvedValue(undefined),
            getList: jest.fn().mockResolvedValue(null),
            setList: jest.fn().mockResolvedValue(undefined),
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
            invalidateOne: jest.fn().mockResolvedValue(undefined),
            invalidateAll: jest.fn().mockResolvedValue(undefined),
        }, { invalidateAll: jest.fn().mockResolvedValue(undefined) }, new store_type_policy_service_1.StoreTypePolicyService(), auditService);
        const result = await service.assignBranchStoreType(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
            isPrimary: true,
            reason: 'Approved for launch.',
        });
        expect(storeTypesRepository.createBranchStoreType).toHaveBeenCalledWith(expect.objectContaining({
            branchId: 'branch_1',
            storeTypeId: 'store_type_grocery',
            status: client_1.BranchStoreTypeStatus.APPROVED,
        }), expect.anything());
        expect(storeTypesRepository.updateBranchPrimaryStoreType).toHaveBeenCalledWith('branch_1', expect.objectContaining({
            primaryStoreTypeId: 'store_type_grocery',
            storeType: 'grocery',
        }), expect.anything());
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'branch_store_types.assigned',
            branchId: 'branch_1',
        }));
        expect(result.status).toBe(client_1.BranchStoreTypeStatus.APPROVED);
        expect(result.isPrimary).toBe(true);
    });
    it('rejects primary flags for non-approved assignment statuses', async () => {
        const service = new store_type_management_service_1.StoreTypeManagementService(makePrismaService(), {}, {
            getById: jest.fn().mockResolvedValue(null),
            setById: jest.fn().mockResolvedValue(undefined),
            getList: jest.fn().mockResolvedValue(null),
            setList: jest.fn().mockResolvedValue(undefined),
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
            invalidateOne: jest.fn().mockResolvedValue(undefined),
            invalidateAll: jest.fn().mockResolvedValue(undefined),
        }, { invalidateAll: jest.fn().mockResolvedValue(undefined) }, new store_type_policy_service_1.StoreTypePolicyService(), makeAuditService());
        await expect(service.assignBranchStoreType(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
            status: client_1.BranchStoreTypeStatus.HIDDEN,
            isPrimary: true,
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
    it('rejects approval of inactive store types for branch visibility', async () => {
        const service = new store_type_management_service_1.StoreTypeManagementService(makePrismaService(), {
            findBranchStoreType: jest.fn().mockResolvedValue(makeAssignment({
                storeType: {
                    id: 'store_type_grocery',
                    code: 'grocery',
                    name: 'Grocery',
                    isActive: false,
                    isSystem: false,
                    deletedAt: new Date('2026-04-30T02:00:00.000Z'),
                },
            })),
        }, {
            getById: jest.fn().mockResolvedValue(null),
            setById: jest.fn().mockResolvedValue(undefined),
            getList: jest.fn().mockResolvedValue(null),
            setList: jest.fn().mockResolvedValue(undefined),
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
            invalidateOne: jest.fn().mockResolvedValue(undefined),
            invalidateAll: jest.fn().mockResolvedValue(undefined),
        }, { invalidateAll: jest.fn().mockResolvedValue(undefined) }, new store_type_policy_service_1.StoreTypePolicyService(), makeAuditService());
        await expect(service.approveBranchStoreType(currentUser, 'branch_1', 'store_type_grocery', {})).rejects.toMatchObject({
            status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.unprocessableEntity,
            }),
        });
    });
});
//# sourceMappingURL=store-type-management.service.spec.js.map