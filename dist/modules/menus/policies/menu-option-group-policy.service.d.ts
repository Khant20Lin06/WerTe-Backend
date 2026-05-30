import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { MenuItemOwnershipRecord } from '../entities/menu-item-ownership.entity';
export declare class MenuOptionGroupPolicyService {
    canManageItem(currentUser: AuthenticatedUserEntity, item: MenuItemOwnershipRecord): boolean;
    canManageOptionGroup(currentUser: AuthenticatedUserEntity, optionGroup: ItemOptionGroupOwnershipRecord): boolean;
}
