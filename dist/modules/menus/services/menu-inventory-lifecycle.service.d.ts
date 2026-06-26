import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MenusRepository } from '../repositories/menus.repository';
type MenuInventoryDatabaseClient = PrismaService | Prisma.TransactionClient;
export type MenuInventoryOrderLineInput = {
    lineKey?: string;
    menuItemId: string;
    quantity: number;
    menuItemStockTrackedSnapshot: boolean;
    selectedVariantCombinationId?: string | null;
    variantCombinationStockTrackedSnapshot?: boolean;
    inventoryLotAllocations?: Array<{
        inventoryLotId: string;
        batchNoSnapshot: string;
        expiryDateSnapshot: string | null;
        quantity: number;
    }>;
    selectedOptions: Array<{
        itemOptionId: string;
        itemOptionStockTrackedSnapshot: boolean;
    }>;
};
export type MenuInventoryLotAllocation = {
    inventoryLotId: string;
    batchNoSnapshot: string;
    expiryDateSnapshot: string | null;
    quantity: number;
};
export type MenuInventoryAlertEvent = {
    merchantUserId: string;
    branchId: string;
    branchName: string | null;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    resourceLabel: string;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK';
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    menuItemName?: string | null;
};
export type MenuInventoryCompensationEvent = {
    merchantUserId: string;
    branchId: string;
    branchName: string | null;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    resourceLabel: string;
    restoredQuantity: number;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    menuItemName?: string | null;
};
export type MenuInventoryReservationResult = {
    alerts: MenuInventoryAlertEvent[];
    inventoryLotAllocationsByLineKey: Record<string, MenuInventoryLotAllocation[]>;
};
export declare class MenuInventoryLifecycleService {
    private readonly menusRepository;
    constructor(menusRepository: MenusRepository);
    reserveTrackedInventoryForOrder(items: MenuInventoryOrderLineInput[], client?: MenuInventoryDatabaseClient): Promise<MenuInventoryReservationResult>;
    restoreTrackedInventoryForOrder(items: MenuInventoryOrderLineInput[], client?: MenuInventoryDatabaseClient): Promise<void>;
    collectTrackedInventoryRestorationAlerts(items: MenuInventoryOrderLineInput[], client?: MenuInventoryDatabaseClient): Promise<MenuInventoryCompensationEvent[]>;
    private reserveTrackedInventoryLots;
    private compareOptionalDates;
    private buildItemAlertEvent;
    private buildOptionAlertEvent;
    private buildItemCompensationEvent;
    private buildOptionCompensationEvent;
    private accumulateQuantity;
    private shouldEmitAlert;
    private resolveItemAttentionLevel;
    private resolveOptionAttentionLevel;
}
export {};
