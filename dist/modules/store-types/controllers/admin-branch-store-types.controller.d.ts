import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdminBranchStoreTypeActionDto } from '../dto/admin-branch-store-type-action.dto';
import { BranchStoreTypeDto } from '../dto/branch-store-type.dto';
import { ListAdminBranchStoreTypesQueryDto } from '../dto/list-admin-branch-store-types-query.dto';
import { ManageBranchStoreTypeDto } from '../dto/manage-branch-store-type.dto';
import { StoreTypeManagementService } from '../services/store-type-management.service';
export declare class AdminBranchStoreTypesController {
    private readonly storeTypeManagementService;
    constructor(storeTypeManagementService: StoreTypeManagementService);
    list(currentUser: AuthenticatedUserEntity, query: ListAdminBranchStoreTypesQueryDto): Promise<BranchStoreTypeDto[]>;
    listByBranch(currentUser: AuthenticatedUserEntity, branchId: string): Promise<BranchStoreTypeDto[]>;
    assign(currentUser: AuthenticatedUserEntity, branchId: string, body: ManageBranchStoreTypeDto): Promise<BranchStoreTypeDto>;
    approve(currentUser: AuthenticatedUserEntity, branchId: string, storeTypeId: string, body: AdminBranchStoreTypeActionDto): Promise<BranchStoreTypeDto>;
    reject(currentUser: AuthenticatedUserEntity, branchId: string, storeTypeId: string, body: AdminBranchStoreTypeActionDto): Promise<BranchStoreTypeDto>;
    hide(currentUser: AuthenticatedUserEntity, branchId: string, storeTypeId: string, body: AdminBranchStoreTypeActionDto): Promise<BranchStoreTypeDto>;
    unhide(currentUser: AuthenticatedUserEntity, branchId: string, storeTypeId: string, body: AdminBranchStoreTypeActionDto): Promise<BranchStoreTypeDto>;
}
