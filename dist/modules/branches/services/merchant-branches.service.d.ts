import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MerchantAccountService } from '../../merchants/services/merchant-account.service';
import { ZonesService } from '../../zones/services/zones.service';
import { BranchDto } from '../dto/branch.dto';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { BranchPolicyService } from '../policies/branch-policy.service';
import { BranchesRepository } from '../repositories/branches.repository';
export declare class MerchantBranchesService {
    private readonly prisma;
    private readonly merchantAccountService;
    private readonly branchesRepository;
    private readonly branchPolicyService;
    private readonly zonesService;
    constructor(prisma: PrismaService, merchantAccountService: MerchantAccountService, branchesRepository: BranchesRepository, branchPolicyService: BranchPolicyService, zonesService: ZonesService);
    listCurrentMerchantBranches(currentUser: AuthenticatedUserEntity): Promise<BranchDto[]>;
    getCurrentMerchantBranch(currentUser: AuthenticatedUserEntity, branchId: string): Promise<BranchDto>;
    createCurrentMerchantBranch(currentUser: AuthenticatedUserEntity, payload: CreateBranchDto): Promise<BranchDto>;
    updateCurrentMerchantBranch(currentUser: AuthenticatedUserEntity, branchId: string, payload: UpdateBranchDto): Promise<BranchDto>;
    private resolveCurrentMerchant;
    private resolveOwnedBranch;
    private normalizeZoneIds;
    private assertValidZoneAssignments;
}
