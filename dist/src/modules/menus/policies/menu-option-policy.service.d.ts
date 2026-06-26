import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ItemOptionGroupOwnershipRecord } from '../entities/item-option-group-ownership.entity';
import { ItemOptionOwnershipRecord } from '../entities/item-option-ownership.entity';
export declare class MenuOptionPolicyService {
    canManageOptionGroup(currentUser: AuthenticatedUserEntity, optionGroup: ItemOptionGroupOwnershipRecord): boolean;
    canManageOption(currentUser: AuthenticatedUserEntity, option: ItemOptionOwnershipRecord): boolean;
}
