import { HttpStatus, Injectable } from '@nestjs/common';
import { MerchantStatus, Prisma } from '@prisma/client';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  merchantOwnershipInclude,
  MerchantOwnershipRecord,
} from '../entities/merchant-ownership.entity';
import {
  MerchantProfileDto,
  toMerchantProfileDto,
} from '../dto/merchant-profile.dto';
import { MerchantsService } from './merchants.service';

@Injectable()
export class AdminMerchantManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly merchantsService: MerchantsService,
  ) {}

  async listMerchants(status?: MerchantStatus): Promise<MerchantProfileDto[]> {
    const where: Prisma.MerchantWhereInput = status ? { status } : {};
    const merchants = await this.prisma.merchant.findMany({
      where,
      include: merchantOwnershipInclude,
      orderBy: { createdAt: 'desc' },
    });
    return merchants.map(toMerchantProfileDto);
  }

  async updateMerchantStatus(
    merchantId: string,
    status: Exclude<MerchantStatus, 'PENDING'>,
  ): Promise<MerchantProfileDto> {
    const existing = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: merchantOwnershipInclude,
    });

    if (existing === null) {
      throw new AppException(
        `Merchant '${merchantId}' was not found.`,
        HttpStatus.NOT_FOUND,
        { code: ErrorCodes.notFound },
      );
    }

    const updated: MerchantOwnershipRecord = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { status },
      include: merchantOwnershipInclude,
    });

    await this.merchantsService.invalidateCache(updated.id, updated.user.id);

    return toMerchantProfileDto(updated);
  }
}
