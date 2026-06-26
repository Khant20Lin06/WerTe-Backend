import { Prisma, UserRole } from '@prisma/client';
export declare const adminInventoryAlertNotificationInclude: {
    user: {
        select: {
            id: true;
            role: true;
            phone: true;
        };
    };
};
export type AdminInventoryAlertNotificationRecord = Prisma.NotificationGetPayload<{
    include: typeof adminInventoryAlertNotificationInclude;
}>;
export type InventoryAlertNotificationSignatureRecord = Prisma.NotificationGetPayload<{
    select: {
        id: true;
        type: true;
        metadataJson: true;
        createdAt: true;
    };
}>;
export type AdminInventoryAlertKind = 'ATTENTION' | 'COMPENSATION';
export type AdminInventoryAttentionLevel = 'LOW_STOCK' | 'OUT_OF_STOCK';
export type InventoryAlertLifecycleStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type AdminInventoryAlertMetadata = {
    alertKind: AdminInventoryAlertKind;
    branchId: string | null;
    branchName: string | null;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    resourceLabel: string;
    menuItemName: string | null;
    attentionLevel: AdminInventoryAttentionLevel | null;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    restoredQuantity: number | null;
    orderId: string | null;
    orderCode: string | null;
    reasonCode: string | null;
};
export declare function readAdminInventoryAlertMetadata(record: Pick<AdminInventoryAlertNotificationRecord, 'type' | 'metadataJson'>): AdminInventoryAlertMetadata | null;
export declare class AdminInventoryAlertNotificationUserEntity {
    userId: string;
    role: UserRole;
    phone: string;
}
