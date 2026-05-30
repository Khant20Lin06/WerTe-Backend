import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../entities/merchant-ownership.entity';
export declare class MerchantPolicyService {
    canAccessMerchant(currentUser: AuthenticatedUserEntity, merchant: MerchantOwnershipRecord): boolean;
}
