import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  merchantOwnershipInclude,
  MerchantOwnershipRecord,
} from '../entities/merchant-ownership.entity';

@Injectable()
export class MerchantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<MerchantOwnershipRecord | null> {
    return this.prisma.merchant.findUnique({
      where: { id },
      include: merchantOwnershipInclude,
    });
  }

  findByUserId(userId: string): Promise<MerchantOwnershipRecord | null> {
    return this.prisma.merchant.findUnique({
      where: { userId },
      include: merchantOwnershipInclude,
    });
  }

  update(
    id: string,
    data: Prisma.MerchantUpdateInput,
  ): Promise<MerchantOwnershipRecord> {
    return this.prisma.merchant.update({
      where: { id },
      data,
      include: merchantOwnershipInclude,
    });
  }
}
