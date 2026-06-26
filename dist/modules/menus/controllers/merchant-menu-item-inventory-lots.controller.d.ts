import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';
import { CreateItemInventoryLotDto } from '../dto/create-item-inventory-lot.dto';
import { ItemInventoryLotDto } from '../dto/item-inventory-lot.dto';
import { UpdateItemInventoryLotDto } from '../dto/update-item-inventory-lot.dto';
import { MerchantMenuItemInventoryLotsService } from '../services/merchant-menu-item-inventory-lots.service';
export declare class MerchantMenuItemInventoryLotsController {
    private readonly merchantMenuItemInventoryLotsService;
    constructor(merchantMenuItemInventoryLotsService: MerchantMenuItemInventoryLotsService);
    list(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string): Promise<ItemInventoryLotDto[]>;
    create(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, body: CreateItemInventoryLotDto): Promise<ItemInventoryLotDto>;
    update(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, lotId: string, body: UpdateItemInventoryLotDto): Promise<ItemInventoryLotDto>;
    adjust(currentUser: AuthenticatedUserEntity, branchId: string, itemId: string, lotId: string, body: AdjustInventoryDto): Promise<ItemInventoryLotDto>;
}
