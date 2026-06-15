import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  customerProfileOwnershipInclude,
  CustomerProfileOwnershipRecord,
} from '../entities/customer-profile-ownership.entity';

@Injectable()
export class CustomerProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<CustomerProfileOwnershipRecord | null> {
    return this.prisma.customerProfile.findUnique({
      where: { id },
      include: customerProfileOwnershipInclude,
    });
  }

  findByUserId(userId: string): Promise<CustomerProfileOwnershipRecord | null> {
    return this.prisma.customerProfile.findUnique({
      where: { userId },
      include: customerProfileOwnershipInclude,
    });
  }

  findAll(opts: {
    status?: UserStatus;
    search?: string;
  }): Promise<CustomerProfileOwnershipRecord[]> {
    const where: Prisma.CustomerProfileWhereInput = {};

    if (opts.status) {
      where.user = { status: opts.status };
    }

    if (opts.search) {
      const q = opts.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.customerProfile.findMany({
      where,
      include: customerProfileOwnershipInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(
    id: string,
    data: Prisma.CustomerProfileUpdateInput,
  ): Promise<CustomerProfileOwnershipRecord> {
    return this.prisma.customerProfile.update({
      where: { id },
      data,
      include: customerProfileOwnershipInclude,
    });
  }
}
