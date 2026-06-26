import { AdminInventoryAlertKind, AdminInventoryAlertStatus } from './admin-inventory-alert.dto';
export declare class ListAdminInventoryAlertsQueryDto {
    limit?: number;
    branchId?: string;
    status?: AdminInventoryAlertStatus | 'ALL';
    merchantUserId?: string;
    alertKind?: AdminInventoryAlertKind | 'ALL';
    resourceType?: 'MENU_ITEM' | 'ITEM_OPTION' | 'ALL';
    attentionLevel?: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL';
    keyword?: string;
}
