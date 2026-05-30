import { UserRole, UserStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  userIdentityInclude,
  UserIdentityRecord,
} from '../entities/actor-context.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<UserIdentityRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: userIdentityInclude,
    });
  }

  findByPhone(phone: string): Promise<UserIdentityRecord | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      include: userIdentityInclude,
    });
  }

  listActiveByRoles(roles: UserRole[]): Promise<UserIdentityRecord[]> {
    if (roles.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.user.findMany({
      where: {
        role: {
          in: roles,
        },
        status: UserStatus.ACTIVE,
      },
      include: userIdentityInclude,
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
  }
}
