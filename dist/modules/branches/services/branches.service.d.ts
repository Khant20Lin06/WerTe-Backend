import { BranchOwnershipEntity, BranchOwnershipRecord } from '../entities/branch-ownership.entity';
import { BranchesRepository } from '../repositories/branches.repository';
export declare class BranchesService {
    private readonly branchesRepository;
    constructor(branchesRepository: BranchesRepository);
    findById(id: string): Promise<BranchOwnershipRecord | null>;
    listByMerchantId(merchantId: string): Promise<BranchOwnershipRecord[]>;
    findOwnedByUserId(userId: string, branchId: string): Promise<BranchOwnershipRecord | null>;
    buildOwnership(branch: BranchOwnershipRecord): BranchOwnershipEntity;
    belongsToMerchantUser(branch: BranchOwnershipRecord, userId: string): boolean;
    belongsToMerchant(branch: BranchOwnershipRecord, merchantId: string): boolean;
}
