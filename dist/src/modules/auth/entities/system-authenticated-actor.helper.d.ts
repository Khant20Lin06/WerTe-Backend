import { UserRole } from '@prisma/client';
import { AuthenticatedUserEntity } from './authenticated-user.entity';
export declare function createSystemAuthenticatedActor(actorId: string, role?: UserRole): AuthenticatedUserEntity;
export declare function isSystemAuthenticatedActor(currentUser: Pick<AuthenticatedUserEntity, 'userId' | 'sessionId'>): boolean;
