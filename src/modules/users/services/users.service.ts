import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

import {
  ActorContextEntity,
  buildActorContext,
  UserIdentityRecord,
} from '../entities/actor-context.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string): Promise<UserIdentityRecord | null> {
    return this.usersRepository.findById(id);
  }

  findByPhone(phone: string): Promise<UserIdentityRecord | null> {
    return this.usersRepository.findByPhone(phone);
  }

  listActiveByRoles(roles: UserRole[]): Promise<UserIdentityRecord[]> {
    return this.usersRepository.listActiveByRoles(roles);
  }

  async findActiveByPhone(phone: string): Promise<UserIdentityRecord | null> {
    const user = await this.findByPhone(phone);
    if (user === null || !this.isActive(user)) {
      return null;
    }

    return user;
  }

  async findActorContextById(id: string): Promise<ActorContextEntity | null> {
    const user = await this.findById(id);
    if (user === null) {
      return null;
    }

    return this.buildActorContext(user);
  }

  buildActorContext(user: UserIdentityRecord): ActorContextEntity {
    return buildActorContext(user);
  }

  isActive(user: UserIdentityRecord): boolean {
    return user.status === UserStatus.ACTIVE;
  }

  isSuspended(user: UserIdentityRecord): boolean {
    return user.status === UserStatus.SUSPENDED;
  }

  isPending(user: UserIdentityRecord): boolean {
    return user.status === UserStatus.PENDING;
  }
}
