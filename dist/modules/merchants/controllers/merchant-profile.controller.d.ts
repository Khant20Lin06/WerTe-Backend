import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantProfileDto } from '../dto/merchant-profile.dto';
import { UpdateMerchantProfileDto } from '../dto/update-merchant-profile.dto';
import { MerchantAccountService } from '../services/merchant-account.service';
export declare class MerchantProfileController {
    private readonly merchantAccountService;
    constructor(merchantAccountService: MerchantAccountService);
    getCurrentProfile(currentUser: AuthenticatedUserEntity): Promise<MerchantProfileDto>;
    updateCurrentProfile(currentUser: AuthenticatedUserEntity, body: UpdateMerchantProfileDto): Promise<MerchantProfileDto>;
}
