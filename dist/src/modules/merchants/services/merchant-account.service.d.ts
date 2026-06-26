import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
import { MerchantPolicyService } from '../policies/merchant-policy.service';
import { MerchantsRepository } from '../repositories/merchants.repository';
import { MerchantProfileDto } from '../dto/merchant-profile.dto';
import { UpdateMerchantProfileDto } from '../dto/update-merchant-profile.dto';
import { MerchantsService } from './merchants.service';
export declare class MerchantAccountService {
    private readonly merchantsService;
    private readonly merchantsRepository;
    private readonly merchantPolicyService;
    constructor(merchantsService: MerchantsService, merchantsRepository: MerchantsRepository, merchantPolicyService: MerchantPolicyService);
    getCurrentMerchantProfile(currentUser: AuthenticatedUserEntity): Promise<MerchantProfileDto>;
    updateCurrentMerchantProfile(currentUser: AuthenticatedUserEntity, payload: UpdateMerchantProfileDto): Promise<MerchantProfileDto>;
    resolveOwnedMerchant(currentUser: AuthenticatedUserEntity): Promise<MerchantOwnershipRecord>;
    private normalizeStoreTypeCode;
}
