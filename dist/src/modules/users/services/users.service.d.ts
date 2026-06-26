import { UserRole } from '@prisma/client';
import { ActorContextEntity, UserIdentityRecord } from '../entities/actor-context.entity';
import { UsersRepository } from '../repositories/users.repository';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findById(id: string): Promise<UserIdentityRecord | null>;
    findByPhone(phone: string): Promise<UserIdentityRecord | null>;
    listActiveByRoles(roles: UserRole[]): Promise<UserIdentityRecord[]>;
    findActiveByPhone(phone: string): Promise<UserIdentityRecord | null>;
    findActorContextById(id: string): Promise<ActorContextEntity | null>;
    buildActorContext(user: UserIdentityRecord): ActorContextEntity;
    isActive(user: UserIdentityRecord): boolean;
    isSuspended(user: UserIdentityRecord): boolean;
    isPending(user: UserIdentityRecord): boolean;
}
