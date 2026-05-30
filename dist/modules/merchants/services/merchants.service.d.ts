import { MerchantOwnershipEntity, MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
import { MerchantsRepository } from '../repositories/merchants.repository';
export declare class MerchantsService {
    private readonly merchantsRepository;
    constructor(merchantsRepository: MerchantsRepository);
    findById(id: string): Promise<MerchantOwnershipRecord | null>;
    findByUserId(userId: string): Promise<MerchantOwnershipRecord | null>;
    findOwnedByUserId(userId: string, merchantId: string): Promise<MerchantOwnershipRecord | null>;
    buildOwnership(merchant: MerchantOwnershipRecord): MerchantOwnershipEntity;
    belongsToUser(merchant: MerchantOwnershipRecord, userId: string): boolean;
}
