"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const merchant_store_type_request_service_1 = require("../../../../src/modules/store-types/services/merchant-store-type-request.service");
const store_type_policy_service_1 = require("../../../../src/modules/store-types/policies/store-type-policy.service");
describe('MerchantStoreTypeRequestService', () => {
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
    const makeBranchSummary = (overrides) => ({
        id: 'branch_1',
        merchantId: 'merchant_1',
        name: 'Downtown Branch',
        status: client_1.BranchStatus.ACTIVE,
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
    const makeStoreType = (overrides) => ({
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
    const makeAssignment = (overrides) => ({
        branchId: 'branch_1',
        storeTypeId: 'store_type_grocery',
        status: client_1.BranchStoreTypeStatus.PENDING,
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
            status: client_1.BranchStatus.ACTIVE,
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
            role: client_1.UserRole.MERCHANT,
        },
        approvedBy: null,
        ...overrides,
    });
    const makePrismaService = () => ({
        runInTransaction: jest.fn(async (callback) => callback({})),
    });
    const makeAuditService = () => ({
        logAction: jest.fn().mockResolvedValue(undefined),
    });
    it('lists active store types available to merchants', async () => {
        const service = new merchant_store_type_request_service_1.MerchantStoreTypeRequestService(makePrismaService(), {
            listActiveStoreTypes: jest.fn().mockResolvedValue([makeStoreType()]),
        }, {
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
        }, new store_type_policy_service_1.StoreTypePolicyService(), makeAuditService());
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
        };
        const service = new merchant_store_type_request_service_1.MerchantStoreTypeRequestService(makePrismaService(), storeTypesRepository, {
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
        }, new store_type_policy_service_1.StoreTypePolicyService(), auditService);
        const result = await service.requestCurrentMerchantBranchStoreType(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
            sortOrder: 10,
            reason: 'Launching grocery next week.',
        });
        expect(storeTypesRepository.createBranchStoreType).toHaveBeenCalledWith(expect.objectContaining({
            branchId: 'branch_1',
            storeTypeId: 'store_type_grocery',
            status: client_1.BranchStoreTypeStatus.PENDING,
            requestedByUserId: 'usr_merchant_1',
        }), expect.anything());
        expect(auditService.logAction).toHaveBeenCalledWith(expect.objectContaining({
            action: 'branch_store_types.requested',
            branchId: 'branch_1',
        }));
        expect(result.status).toBe(client_1.BranchStoreTypeStatus.PENDING);
    });
    it('rejects requests for branches owned by another merchant', async () => {
        const service = new merchant_store_type_request_service_1.MerchantStoreTypeRequestService(makePrismaService(), {
            findBranchSummaryById: jest.fn().mockResolvedValue(makeBranchSummary({
                merchant: {
                    id: 'merchant_2',
                    userId: 'usr_merchant_2',
                    name: 'Other Merchant',
                    storeType: 'restaurant',
                    primaryStoreTypeId: null,
                },
            })),
        }, {
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
        }, new store_type_policy_service_1.StoreTypePolicyService(), makeAuditService());
        await expect(service.listCurrentMerchantBranchStoreTypes(currentUser, 'branch_1')).rejects.toMatchObject({
            status: common_1.HttpStatus.FORBIDDEN,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.forbidden,
            }),
        });
    });
    it('rejects re-requesting store types that are already approved', async () => {
        const service = new merchant_store_type_request_service_1.MerchantStoreTypeRequestService(makePrismaService(), {
            findBranchSummaryById: jest.fn().mockResolvedValue(makeBranchSummary()),
            findStoreTypeById: jest.fn().mockResolvedValue(makeStoreType()),
            findBranchStoreType: jest.fn().mockResolvedValue(makeAssignment({
                status: client_1.BranchStoreTypeStatus.APPROVED,
                approvedByUserId: 'usr_admin_1',
                approvedAt: new Date('2026-04-30T02:00:00.000Z'),
            })),
        }, {
            getActiveList: jest.fn().mockResolvedValue(null),
            setActiveList: jest.fn().mockResolvedValue(undefined),
        }, new store_type_policy_service_1.StoreTypePolicyService(), makeAuditService());
        await expect(service.requestCurrentMerchantBranchStoreType(currentUser, 'branch_1', {
            storeTypeId: 'store_type_grocery',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.conflict,
            }),
        });
    });
});
//# sourceMappingURL=merchant-store-type-request.service.spec.js.map