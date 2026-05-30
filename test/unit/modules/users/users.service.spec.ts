import { UserRole, UserStatus } from '@prisma/client';

import { UserIdentityRecord } from '../../../../src/modules/users/entities/actor-context.entity';
import { UsersRepository } from '../../../../src/modules/users/repositories/users.repository';
import { UsersService } from '../../../../src/modules/users/services/users.service';

describe('UsersService', () => {
  const makeUser = (
    overrides?: Partial<UserIdentityRecord>,
  ): UserIdentityRecord => ({
    id: 'usr_1',
    phone: '09123456789',
    passwordHash: 'hash',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
    createdAt: new Date('2026-04-18T00:00:00.000Z'),
    updatedAt: new Date('2026-04-18T00:00:00.000Z'),
    customerProfile: { id: 'cust_prof_1' },
    riderProfile: null,
    merchantProfile: null,
    ...overrides,
  });

  it('builds actor context from the user identity aggregate', () => {
    const repository = {} as UsersRepository;
    const service = new UsersService(repository);

    const actorContext = service.buildActorContext(makeUser());

    expect(actorContext).toEqual({
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
      riderId: undefined,
      merchantId: undefined,
    });
  });

  it('returns null when the phone belongs to a non-active user', async () => {
    const repository = {
      findByPhone: jest.fn().mockResolvedValue(
        makeUser({
          status: UserStatus.SUSPENDED,
        }),
      ),
    } as unknown as UsersRepository;
    const service = new UsersService(repository);

    const result = await service.findActiveByPhone('09123456789');

    expect(result).toBeNull();
  });
});
