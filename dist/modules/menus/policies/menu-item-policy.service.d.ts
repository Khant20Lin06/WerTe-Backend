import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { MenuCategoryOwnershipRecord } from '../entities/menu-category-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
export declare class MenuItemPolicyService {
    canManageBranchCatalog(currentUser: AuthenticatedUserEntity, branch: BranchOwnershipRecord): boolean;
    canUseCategory(currentUser: AuthenticatedUserEntity, category: MenuCategoryOwnershipRecord): boolean;
    canManageItem(currentUser: AuthenticatedUserEntity, item: MenuItemOwnershipRecord): boolean;
}
