import { Injectable } from '@nestjs/common';

import {
  buildMerchantOwnership,
  MerchantOwnershipEntity,
  MerchantOwnershipRecord,
} from '../entities/merchant-ownership.entity';
import { MerchantsRepository } from '../repositories/merchants.repository';
import { MerchantCacheService } from './merchant-cache.service';

@Injectable()
export class MerchantsService {
  constructor(
    private readonly merchantsRepository: MerchantsRepository,
    private readonly merchantCache: MerchantCacheService,
  ) {}

  async findById(id: string): Promise<MerchantOwnershipRecord | null> {
    const cached = await this.merchantCache.getById(id);
    if (cached !== null) return cached;

    const merchant = await this.merchantsRepository.findById(id);
    if (merchant !== null) {
      await Promise.all([
        this.merchantCache.setById(merchant),
        this.merchantCache.setByUserId(merchant.user.id, merchant),
      ]);
    }

    return merchant;
  }

  async findByUserId(userId: string): Promise<MerchantOwnershipRecord | null> {
    const cached = await this.merchantCache.getByUserId(userId);
    if (cached !== null) return cached;

    const merchant = await this.merchantsRepository.findByUserId(userId);
    if (merchant !== null) {
      await Promise.all([
        this.merchantCache.setByUserId(userId, merchant),
        this.merchantCache.setById(merchant),
      ]);
    }

    return merchant;
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

  async invalidateCache(merchantId: string, userId: string): Promise<void> {
    await this.merchantCache.invalidate(merchantId, userId);
  }
}
