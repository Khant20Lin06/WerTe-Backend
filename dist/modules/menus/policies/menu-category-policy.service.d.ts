import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
export declare class MenuCategoryPolicyService {
    canManageBranchCatalog(currentUser: AuthenticatedUserEntity, branch: BranchOwnershipRecord): boolean;
    canManageCategory(currentUser: AuthenticatedUserEntity, category: MenuCategoryOwnershipRecord): boolean;
}
