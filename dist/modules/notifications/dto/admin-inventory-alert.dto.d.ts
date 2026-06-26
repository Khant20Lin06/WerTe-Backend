import { NotificationType, UserRole } from '@prisma/client';
export declare enum AdminInventoryAlertStatus {
    OPEN = "OPEN",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    RESOLVED = "RESOLVED",
    DISMISSED = "DISMISSED"
}
export declare enum AdminInventoryAlertKind {
    ATTENTION = "ATTENTION",
    COMPENSATION = "COMPENSATION"
}
export declare class AdminInventoryAlertAcknowledgerDto {
    userId: string;
    role: UserRole;
    phone: string;
}
export declare class AdminInventoryAlertDto {
    notificationId: string;
    type: NotificationType;
    title: string;
    body: string;
    navigationPath: string | null;
    merchantUserId: string;
    merchantRole: UserRole;
    merchantPhone: string;
    branchId: string | null;
    branchName: string | null;
    alertKind: AdminInventoryAlertKind;
    resourceType: 'MENU_ITEM' | 'ITEM_OPTION';
    resourceId: string;
    resourceLabel: string;
    menuItemName: string | null;
    attentionLevel: 'LOW_STOCK' | 'OUT_OF_STOCK' | null;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    restoredQuantity: number | null;
    orderId: string | null;
    orderCode: string | null;
    reasonCode: string | null;
    merchantReadAt: string | null;
    status: AdminInventoryAlertStatus;
    acknowledgementNote: string | null;
    acknowledgedAt: string | null;
    acknowledgedBy: AdminInventoryAlertAcknowledgerDto | null;
    statusNote: string | null;
    statusChangedAt: string | null;
    statusChangedBy: AdminInventoryAlertAcknowledgerDto | null;
    createdAt: string;
}
