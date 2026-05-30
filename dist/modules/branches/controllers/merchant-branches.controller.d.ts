import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchDto } from '../dto/branch.dto';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { MerchantBranchesService } from '../services/merchant-branches.service';
export declare class MerchantBranchesController {
    private readonly merchantBranchesService;
    constructor(merchantBranchesService: MerchantBranchesService);
    list(currentUser: AuthenticatedUserEntity): Promise<BranchDto[]>;
    get(currentUser: AuthenticatedUserEntity, branchId: string): Promise<BranchDto>;
    create(currentUser: AuthenticatedUserEntity, body: CreateBranchDto): Promise<BranchDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, body: UpdateBranchDto): Promise<BranchDto>;
}
