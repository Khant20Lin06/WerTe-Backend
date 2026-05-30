import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
