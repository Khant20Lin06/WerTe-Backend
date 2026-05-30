import { NotificationType, Prisma, UserRole } from '@prisma/client';

export const adminInventoryAlertNotificationInclude =
  Prisma.validator<Prisma.NotificationInclude>()({
    user: {
      select: {
        id: true,
        role: true,
        phone: true,
      },
    },
  });

export type AdminInventoryAlertNotificationRecord = Prisma.NotificationGetPayload<{
  include: typeof adminInventoryAlertNotificationInclude;
}>;

export type InventoryAlertNotificationSignatureRecord =
  Prisma.NotificationGetPayload<{
    select: {
      id: true;
      type: true;
      metadataJson: true;
      createdAt: true;
    };
  }>;

export type AdminInventoryAlertKind = 'ATTENTION' | 'COMPENSATION';
export type AdminInventoryAttentionLevel = 'LOW_STOCK' | 'OUT_OF_STOCK';
export type InventoryAlertLifecycleStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'DISMISSED';

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

export function readAdminInventoryAlertMetadata(
  record: Pick<AdminInventoryAlertNotificationRecord, 'type' | 'metadataJson'>,
): AdminInventoryAlertMetadata | null {
  if (record.type !== NotificationType.SYSTEM_ALERT) {
    return null;
  }

  if (
    record.metadataJson === null ||
    typeof record.metadataJson !== 'object' ||
    Array.isArray(record.metadataJson)
  ) {
    return null;
  }

  const metadata = record.metadataJson as Record<string, unknown>;
  const alertKind =
    metadata.alertKind === 'COMPENSATION' ? 'COMPENSATION' : 'ATTENTION';
  const resourceType = metadata.resourceType;
  const resourceId = metadata.resourceId;
  const resourceLabel = metadata.resourceLabel;
  const attentionLevel = metadata.attentionLevel;
  const restoredQuantity = readOptionalNumber(metadata.restoredQuantity);

  if (
    (resourceType !== 'MENU_ITEM' && resourceType !== 'ITEM_OPTION') ||
    typeof resourceId !== 'string' ||
    resourceId.trim().length === 0 ||
    typeof resourceLabel !== 'string' ||
    resourceLabel.trim().length === 0
  ) {
    return null;
  }

  if (
    alertKind === 'ATTENTION' &&
    attentionLevel !== 'LOW_STOCK' &&
    attentionLevel !== 'OUT_OF_STOCK'
  ) {
    return null;
  }

  if (
    alertKind === 'COMPENSATION' &&
    (restoredQuantity === null || restoredQuantity <= 0)
  ) {
    return null;
  }

  return {
    alertKind,
    branchId: readOptionalString(metadata.branchId),
    branchName: readOptionalString(metadata.branchName),
    resourceType,
    resourceId: resourceId.trim(),
    resourceLabel: resourceLabel.trim(),
    menuItemName: readOptionalString(metadata.menuItemName),
    attentionLevel:
      alertKind === 'ATTENTION'
        ? (attentionLevel as AdminInventoryAttentionLevel)
        : null,
    stockQuantity: readOptionalNumber(metadata.stockQuantity),
    lowStockThreshold: readOptionalNumber(metadata.lowStockThreshold),
    restoredQuantity,
    orderId: readOptionalString(metadata.orderId),
    orderCode: readOptionalString(metadata.orderCode),
    reasonCode: readOptionalString(metadata.reasonCode),
  };
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized.length === 0 ? null : normalized;
}

function readOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export class AdminInventoryAlertNotificationUserEntity {
  userId!: string;
  role!: UserRole;
  phone!: string;
}
