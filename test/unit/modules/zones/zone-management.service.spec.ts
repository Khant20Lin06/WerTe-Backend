import { HttpStatus } from '@nestjs/common';
import { UserRole, UserStatus, ZoneStatus } from '@prisma/client';

import { ErrorCodes } from '../../../../src/common/constants/error-codes';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { ZoneManagementRecord } from '../../../../src/modules/zones/entities/zone-management.entity';
import { ZonePolicyService } from '../../../../src/modules/zones/policies/zone-policy.service';
import { ZonesRepository } from '../../../../src/modules/zones/repositories/zones.repository';
import { ZoneManagementService } from '../../../../src/modules/zones/services/zone-management.service';

describe('ZoneManagementService', () => {
  const adminUser: AuthenticatedUserEntity = {
    userId: 'usr_admin_1',
    sessionId: 'session_1',
    role: UserRole.ADMIN,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_admin_1',
      phone: '09111111111',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  };

  const merchantUser: AuthenticatedUserEntity = {
    userId: 'usr_merchant_1',
    sessionId: 'session_2',
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

  const makeZone = (
    overrides?: Partial<ZoneManagementRecord>,
  ): ZoneManagementRecord => ({
    id: 'zone_1',
    code: 'YGN-DT',
    name: 'Downtown',
    description: 'Central Yangon delivery zone',
    status: ZoneStatus.ACTIVE,
    createdAt: new Date('2026-04-19T00:00:00.000Z'),
    updatedAt: new Date('2026-04-19T00:00:00.000Z'),
    _count: {
      branchZones: 2,
    },
    ...overrides,
  });

  it('lists administrative zones with branch counts', async () => {
    const service = new ZoneManagementService(
      {
        listAll: jest.fn().mockResolvedValue([makeZone()]),
      } as unknown as ZonesRepository,
      new ZonePolicyService(),
    );

    await expect(service.listZones(adminUser)).resolves.toEqual([
      {
        id: 'zone_1',
        code: 'YGN-DT',
        name: 'Downtown',
        description: 'Central Yangon delivery zone',
        status: ZoneStatus.ACTIVE,
        branchCount: 2,
        createdAt: '2026-04-19T00:00:00.000Z',
        updatedAt: '2026-04-19T00:00:00.000Z',
      },
    ]);
  });

  it('rejects duplicate zone codes during create', async () => {
    const service = new ZoneManagementService(
      {
        findManagementByCode: jest.fn().mockResolvedValue(makeZone()),
      } as unknown as ZonesRepository,
      new ZonePolicyService(),
    );

    await expect(
      service.createZone(adminUser, {
        code: 'YGN-DT',
        name: 'Downtown',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: expect.objectContaining({
        code: ErrorCodes.conflict,
      }),
    });
  });

  it('allows merchants to read active zones for branch assignment flows', async () => {
    const service = new ZoneManagementService(
      {
        listActive: jest.fn().mockResolvedValue([
          {
            id: 'zone_1',
            code: 'YGN-DT',
            name: 'Downtown',
            description: 'Central Yangon delivery zone',
            status: ZoneStatus.ACTIVE,
            createdAt: new Date('2026-04-19T00:00:00.000Z'),
            updatedAt: new Date('2026-04-19T00:00:00.000Z'),
          },
        ]),
      } as unknown as ZonesRepository,
      new ZonePolicyService(),
    );

    await expect(service.listActiveZones(merchantUser)).resolves.toEqual([
      {
        id: 'zone_1',
        code: 'YGN-DT',
        name: 'Downtown',
        description: 'Central Yangon delivery zone',
        status: ZoneStatus.ACTIVE,
        branchCount: undefined,
        createdAt: '2026-04-19T00:00:00.000Z',
        updatedAt: '2026-04-19T00:00:00.000Z',
      },
    ]);
  });
});
