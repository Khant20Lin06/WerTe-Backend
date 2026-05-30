import { ZoneStatus } from '@prisma/client';

import { ZoneReadRecord } from '../../../../src/modules/zones/entities/zone-read.entity';
import { ZonesRepository } from '../../../../src/modules/zones/repositories/zones.repository';
import { ZonesService } from '../../../../src/modules/zones/services/zones.service';

describe('ZonesService', () => {
  const makeZone = (overrides?: Partial<ZoneReadRecord>): ZoneReadRecord => ({
    id: 'zone_1',
    code: 'YGN-DT',
    name: 'Downtown',
    description: 'Central Yangon zone',
    status: ZoneStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    ...overrides,
  });

  it('builds a simple zone read model', () => {
    const repository = {} as ZonesRepository;
    const service = new ZonesService(repository);

    const zone = service.buildReadModel(makeZone());

    expect(zone).toEqual({
      zoneId: 'zone_1',
      code: 'YGN-DT',
      name: 'Downtown',
      description: 'Central Yangon zone',
      status: ZoneStatus.ACTIVE,
    });
  });
});
