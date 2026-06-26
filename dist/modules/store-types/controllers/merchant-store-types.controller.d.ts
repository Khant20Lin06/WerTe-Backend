import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AvailableStoreTypeDto } from '../dto/available-store-type.dto';
import { BranchStoreTypeDto } from '../dto/branch-store-type.dto';
import { RequestBranchStoreTypeDto } from '../dto/request-branch-store-type.dto';
import { MerchantStoreTypeRequestService } from '../services/merchant-store-type-request.service';
export declare class MerchantStoreTypesController {
    private readonly merchantStoreTypeRequestService;
    constructor(merchantStoreTypeRequestService: MerchantStoreTypeRequestService);
    listAvailable(currentUser: AuthenticatedUserEntity): Promise<AvailableStoreTypeDto[]>;
    listBranchAssignments(currentUser: AuthenticatedUserEntity, branchId: string): Promise<BranchStoreTypeDto[]>;
    request(currentUser: AuthenticatedUserEntity, branchId: string, body: RequestBranchStoreTypeDto): Promise<BranchStoreTypeDto>;
}
