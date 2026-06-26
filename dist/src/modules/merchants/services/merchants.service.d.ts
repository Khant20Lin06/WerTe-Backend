import { MerchantOwnershipEntity, MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
import { MerchantsRepository } from '../repositories/merchants.repository';
import { MerchantCacheService } from './merchant-cache.service';
export declare class MerchantsService {
    private readonly merchantsRepository;
    private readonly merchantCache;
    constructor(merchantsRepository: MerchantsRepository, merchantCache: MerchantCacheService);
    findById(id: string): Promise<MerchantOwnershipRecord | null>;
    findByUserId(userId: string): Promise<MerchantOwnershipRecord | null>;
    findOwnedByUserId(userId: string, merchantId: string): Promise<MerchantOwnershipRecord | null>;
    buildOwnership(merchant: MerchantOwnershipRecord): MerchantOwnershipEntity;
    belongsToUser(merchant: MerchantOwnershipRecord, userId: string): boolean;
    invalidateCache(merchantId: string, userId: string): Promise<void>;
}
