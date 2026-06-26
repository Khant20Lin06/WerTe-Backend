"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const branches_service_1 = require("../../../../src/modules/branches/services/branches.service");
describe('BranchesService', () => {
    const makeBranch = (overrides) => ({
        id: 'br_1',
        merchantId: 'merch_1',
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
            id: 'merch_1',
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
        ...overrides,
    });
    it('builds branch ownership with merchant and zone context', () => {
        const repository = {};
        const service = new branches_service_1.BranchesService(repository, {});
        const ownership = service.buildOwnership(makeBranch());
        expect(ownership).toEqual({
            branchId: 'br_1',
            merchantId: 'merch_1',
            merchantUserId: 'usr_merchant_1',
            merchantName: 'Tea House',
            merchantStoreType: 'restaurant',
            merchantStatus: client_1.MerchantStatus.ACTIVE,
            phone: '0999999999',
            role: client_1.UserRole.MERCHANT,
            userStatus: client_1.UserStatus.ACTIVE,
            name: 'Downtown Branch',
            township: 'Botahtaung',
            storeType: 'restaurant',
            status: client_1.BranchStatus.ACTIVE,
            zones: [
                {
                    zoneId: 'zone_1',
                    code: 'YGN-DT',
                    name: 'Downtown',
                    status: client_1.ZoneStatus.ACTIVE,
                },
            ],
        });
    });
    it('returns null when the branch does not belong to the merchant user', async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue(makeBranch()),
        };
        const service = new branches_service_1.BranchesService(repository, {
            getById: jest.fn().mockResolvedValue(null),
            setById: jest.fn().mockResolvedValue(undefined),
        });
        const branch = await service.findOwnedByUserId('usr_merchant_2', 'br_1');
        expect(branch).toBeNull();
    });
});
//# sourceMappingURL=branches.service.spec.js.map