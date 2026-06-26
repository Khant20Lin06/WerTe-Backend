import { UserRole, UserStatus } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../../src/modules/auth/entities/authenticated-user.entity';
import { AuthRepository } from '../../../src/modules/auth/repositories/auth.repository';
import { ActorContextEntity } from '../../../src/modules/users/entities/actor-context.entity';
import { UsersService } from '../../../src/modules/users/services/users.service';
type IntegrationActorInput = {
    key: string;
    userId: string;
    role: UserRole;
    phone: string;
    sessionId: string;
    status?: UserStatus;
    customerProfileId?: string;
    merchantId?: string;
    riderId?: string;
};
type IntegrationSessionUser = {
    id: string;
    role: UserRole;
    phone: string;
    status: UserStatus;
    customerProfile: {
        id: string;
    } | null;
    merchantProfile: {
        id: string;
    } | null;
    riderProfile: {
        id: string;
    } | null;
};
type IntegrationActorFixture = {
    key: string;
    accessToken: string;
    actorContext: ActorContextEntity;
    currentUser: AuthenticatedUserEntity;
    session: {
        id: string;
        userId: string;
        revokedAt: Date | null;
        expiresAt: Date;
        user: IntegrationSessionUser;
    };
};
export declare function createAuthSessionHarness<const TActors extends readonly IntegrationActorInput[]>(inputs: TActors): Promise<{
    authRepository: jest.Mocked<Partial<AuthRepository>>;
    usersService: jest.Mocked<Partial<UsersService>>;
    actors: Record<TActors[number]['key'], IntegrationActorFixture>;
}>;
export {};
