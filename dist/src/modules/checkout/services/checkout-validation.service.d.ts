import { CartAggregateEntity } from '../../carts/entities/cart-aggregate.entity';
import { BranchOwnershipRecord } from '../../branches/entities/branch-ownership.entity';
import { MenusService } from '../../menus/services/menus.service';
export declare class CheckoutValidationService {
    private readonly menusService;
    constructor(menusService: MenusService);
    assertCartReadyForCheckout(branch: BranchOwnershipRecord, cart: CartAggregateEntity): Promise<void>;
    private assertBranchIsOrderable;
    private assertCartIsNotEmpty;
    private assertCartBranchMatches;
    private assertMenuItemIsAvailable;
    private assertCartItemSelectionsRemainValid;
    private assertMenuItemInventoryRemainsAvailable;
    private assertSelectedOptionInventoryRemainsAvailable;
    private assertSelectedVariantCombinationRemainsAvailable;
}
