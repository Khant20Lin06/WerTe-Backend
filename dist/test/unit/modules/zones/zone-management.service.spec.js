"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_codes_1 = require("../../../../src/common/constants/error-codes");
const zone_policy_service_1 = require("../../../../src/modules/zones/policies/zone-policy.service");
const zone_management_service_1 = require("../../../../src/modules/zones/services/zone-management.service");
describe('ZoneManagementService', () => {
    const adminUser = {
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
    const merchantUser = {
        userId: 'usr_merchant_1',
        sessionId: 'session_2',
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
    const makeZone = (overrides) => ({
        id: 'zone_1',
        code: 'YGN-DT',
        name: 'Downtown',
        description: 'Central Yangon delivery zone',
        status: client_1.ZoneStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        _count: {
            branchZones: 2,
        },
        ...overrides,
    });
    it('lists administrative zones with branch counts', async () => {
        const service = new zone_management_service_1.ZoneManagementService({
            listAll: jest.fn().mockResolvedValue([makeZone()]),
        }, new zone_policy_service_1.ZonePolicyService());
        await expect(service.listZones(adminUser)).resolves.toEqual([
            {
                id: 'zone_1',
                code: 'YGN-DT',
                name: 'Downtown',
                description: 'Central Yangon delivery zone',
                status: client_1.ZoneStatus.ACTIVE,
                branchCount: 2,
                createdAt: '2026-04-19T00:00:00.000Z',
                updatedAt: '2026-04-19T00:00:00.000Z',
            },
        ]);
    });
    it('rejects duplicate zone codes during create', async () => {
        const service = new zone_management_service_1.ZoneManagementService({
            findManagementByCode: jest.fn().mockResolvedValue(makeZone()),
        }, new zone_policy_service_1.ZonePolicyService());
        await expect(service.createZone(adminUser, {
            code: 'YGN-DT',
            name: 'Downtown',
        })).rejects.toMatchObject({
            status: common_1.HttpStatus.CONFLICT,
            response: expect.objectContaining({
                code: error_codes_1.ErrorCodes.conflict,
            }),
        });
    });
    it('allows merchants to read active zones for branch assignment flows', async () => {
        const service = new zone_management_service_1.ZoneManagementService({
            listActive: jest.fn().mockResolvedValue([
                {
                    id: 'zone_1',
                    code: 'YGN-DT',
                    name: 'Downtown',
                    description: 'Central Yangon delivery zone',
                    status: client_1.ZoneStatus.ACTIVE,
                    createdAt: new Date('2026-04-19T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
                },
            ]),
        }, new zone_policy_service_1.ZonePolicyService());
        await expect(service.listActiveZones(merchantUser)).resolves.toEqual([
            {
                id: 'zone_1',
                code: 'YGN-DT',
                name: 'Downtown',
                description: 'Central Yangon delivery zone',
                status: client_1.ZoneStatus.ACTIVE,
                branchCount: undefined,
                createdAt: '2026-04-19T00:00:00.000Z',
                updatedAt: '2026-04-19T00:00:00.000Z',
            },
        ]);
    });
});
//# sourceMappingURL=zone-management.service.spec.js.map