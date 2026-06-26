import { MenuItemInventoryLotRecord } from '../entities/menu-item-inventory-lot.entity';
export declare class ItemInventoryLotDto {
    id: string;
    menuItemId: string;
    batchNo: string;
    expiryDate: string | null;
    receivedAt: string;
    receivedQuantity: number;
    remainingQuantity: number;
    note: string | null;
    isExpired: boolean;
    isDepleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare function toItemInventoryLotDto(lot: MenuItemInventoryLotRecord): ItemInventoryLotDto;
