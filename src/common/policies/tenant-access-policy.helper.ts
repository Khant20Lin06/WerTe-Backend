import { UserRole } from '@prisma/client';

import { AuthenticatedUserEntity } from '../../modules/auth/entities/authenticated-user.entity';

type OwnedResourceAccessInput = {
  currentUser: AuthenticatedUserEntity;
  expectedRole: UserRole;
  ownerUserId: string;
  resourceId: string;
  actorScopedResourceId?: string;
};

export function hasRole(
  currentUser: AuthenticatedUserEntity,
  expectedRole: UserRole,
): boolean {
  return currentUser.role === expectedRole;
}

export function hasAnyRole(
  currentUser: AuthenticatedUserEntity,
  expectedRoles: UserRole[],
): boolean {
  return expectedRoles.includes(currentUser.role);
}

export function matchesActorScopedResource(
  actorScopedResourceId: string | undefined,
  resourceId: string,
): boolean {
  return actorScopedResourceId === undefined || actorScopedResourceId === resourceId;
}

export function hasOwnedResourceAccess({
  currentUser,
  expectedRole,
  ownerUserId,
  resourceId,
  actorScopedResourceId,
}: OwnedResourceAccessInput): boolean {
  return (
    hasRole(currentUser, expectedRole) &&
    currentUser.userId === ownerUserId &&
    matchesActorScopedResource(actorScopedResourceId, resourceId)
  );
}
