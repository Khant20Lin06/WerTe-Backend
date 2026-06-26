import { UserRole } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../modules/auth/entities/authenticated-user.entity';
type OwnedResourceAccessInput = {
    currentUser: AuthenticatedUserEntity;
    expectedRole: UserRole;
    ownerUserId: string;
    resourceId: string;
    actorScopedResourceId?: string;
};
export declare function hasRole(currentUser: AuthenticatedUserEntity, expectedRole: UserRole): boolean;
export declare function hasAnyRole(currentUser: AuthenticatedUserEntity, expectedRoles: UserRole[]): boolean;
export declare function matchesActorScopedResource(actorScopedResourceId: string | undefined, resourceId: string): boolean;
export declare function hasOwnedResourceAccess({ currentUser, expectedRole, ownerUserId, resourceId, actorScopedResourceId, }: OwnedResourceAccessInput): boolean;
export {};
