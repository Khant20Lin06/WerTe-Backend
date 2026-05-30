import { UserRole, UserStatus } from '@prisma/client';

import { AuthenticatedUserEntity } from './authenticated-user.entity';

const SYSTEM_ACTOR_PREFIX = 'system:';

export function createSystemAuthenticatedActor(
  actorId: string,
  role: UserRole = UserRole.SUPPORT,
): AuthenticatedUserEntity {
  const userId = actorId.startsWith(SYSTEM_ACTOR_PREFIX)
    ? actorId
    : `${SYSTEM_ACTOR_PREFIX}${actorId}`;

  return {
    userId,
    sessionId: userId,
    role,
    tokenType: 'access',
    actorContext: {
      userId,
      phone: 'system',
      role,
      status: UserStatus.ACTIVE,
    },
  };
}

export function isSystemAuthenticatedActor(
  currentUser: Pick<AuthenticatedUserEntity, 'userId' | 'sessionId'>,
): boolean {
  return (
    currentUser.userId.startsWith(SYSTEM_ACTOR_PREFIX) ||
    currentUser.sessionId.startsWith(SYSTEM_ACTOR_PREFIX)
  );
}
