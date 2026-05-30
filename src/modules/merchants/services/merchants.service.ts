import { Injectable } from '@nestjs/common';

import {
  buildMerchantOwnership,
  MerchantOwnershipEntity,
  MerchantOwnershipRecord,
} from '../entities/merchant-ownership.entity';
import { MerchantsRepository } from '../repositories/merchants.repository';

@Injectable()
export class MerchantsService {
  constructor(private readonly merchantsRepository: MerchantsRepository) {}

  findById(id: string): Promise<MerchantOwnershipRecord | null> {
    return this.merchantsRepository.findById(id);
  }

  findByUserId(userId: string): Promise<MerchantOwnershipRecord | null> {
    return this.merchantsRepository.findByUserId(userId);
  }

  async findOwnedByUserId(
    userId: string,
    merchantId: string,
  ): Promise<MerchantOwnershipRecord | null> {
    const merchant = await this.findById(merchantId);
    if (merchant === null || !this.belongsToUser(merchant, userId)) {
      return null;
    }

    return merchant;
  }

  buildOwnership(merchant: MerchantOwnershipRecord): MerchantOwnershipEntity {
    return buildMerchantOwnership(merchant);
  }

  belongsToUser(merchant: MerchantOwnershipRecord, userId: string): boolean {
    return merchant.user.id === userId;
  }
}
