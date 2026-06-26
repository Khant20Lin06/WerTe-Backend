"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zones_service_1 = require("../../../../src/modules/zones/services/zones.service");
describe('ZonesService', () => {
    const makeZone = (overrides) => ({
        id: 'zone_1',
        code: 'YGN-DT',
        name: 'Downtown',
        description: 'Central Yangon zone',
        status: client_1.ZoneStatus.ACTIVE,
        createdAt: new Date('2026-04-19T00:00:00.000Z'),
        updatedAt: new Date('2026-04-19T00:00:00.000Z'),
        ...overrides,
    });
    it('builds a simple zone read model', () => {
        const repository = {};
        const service = new zones_service_1.ZonesService(repository);
        const zone = service.buildReadModel(makeZone());
        expect(zone).toEqual({
            zoneId: 'zone_1',
            code: 'YGN-DT',
            name: 'Downtown',
            description: 'Central Yangon zone',
            status: client_1.ZoneStatus.ACTIVE,
        });
    });
});
//# sourceMappingURL=zones.service.spec.js.map