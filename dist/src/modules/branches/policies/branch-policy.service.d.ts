import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantOwnershipRecord } from '../../merchants/entities/merchant-ownership.entity';
import { BranchOwnershipRecord } from '../entities/branch-ownership.entity';
export declare class BranchPolicyService {
    canManageMerchant(currentUser: AuthenticatedUserEntity, merchant: MerchantOwnershipRecord): boolean;
    canManageBranch(currentUser: AuthenticatedUserEntity, branch: BranchOwnershipRecord): boolean;
}
