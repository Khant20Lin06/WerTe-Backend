import { UserRole, UserStatus } from '@prisma/client';

import { AuthenticatedUserEntity } from '../../../src/modules/auth/entities/authenticated-user.entity';

export function makeAuthenticatedUser(
  overrides?: Partial<AuthenticatedUserEntity>,
): AuthenticatedUserEntity {
  return {
    userId: 'usr_1',
    sessionId: 'session_1',
    role: UserRole.CUSTOMER,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
    ...overrides,
  };
}
