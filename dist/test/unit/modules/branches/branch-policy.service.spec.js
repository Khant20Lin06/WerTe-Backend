"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const branch_policy_service_1 = require("../../../../src/modules/branches/policies/branch-policy.service");
const authenticated_user_factory_1 = require("../../helpers/authenticated-user.factory");
describe('BranchPolicyService', () => {
    const service = new branch_policy_service_1.BranchPolicyService();
    const merchant = {
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
    const branch = {
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
        operatingHours: null,
        staffAssignments: [],
    };
    it('allows the owning merchant user to manage merchant context', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_1',
            },
        });
        expect(service.canManageMerchant(currentUser, merchant)).toBe(true);
    });
    it('denies managing a branch outside the merchant scope', () => {
        const currentUser = (0, authenticated_user_factory_1.makeAuthenticatedUser)({
            userId: 'usr_merchant_1',
            role: client_1.UserRole.MERCHANT,
            actorContext: {
                userId: 'usr_merchant_1',
                phone: '0999999999',
                role: client_1.UserRole.MERCHANT,
                status: client_1.UserStatus.ACTIVE,
                merchantId: 'merchant_2',
            },
        });
        expect(service.canManageBranch(currentUser, branch)).toBe(false);
    });
});
//# sourceMappingURL=branch-policy.service.spec.js.map