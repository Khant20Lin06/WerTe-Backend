import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, UserRole } from '@prisma/client';

export enum AdminInventoryAlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum AdminInventoryAlertKind {
  ATTENTION = 'ATTENTION',
  COMPENSATION = 'COMPENSATION',
}

export class AdminInventoryAlertAcknowledgerDto {
  @ApiProperty({
    description: 'Administrator user identifier.',
    example: 'usr_admin_1',
  })
  userId!: string;

  @ApiProperty({
    description: 'Administrator role that acknowledged the alert.',
    enum: UserRole,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Administrator phone number.',
    example: '099999999',
  })
  phone!: string;
}

export class AdminInventoryAlertDto {
  @ApiProperty({
    description: 'Notification identifier for the inventory alert.',
    example: 'notification_1',
  })
  notificationId!: string;

  @ApiProperty({
    description: 'Notification type.',
    enum: NotificationType,
    example: NotificationType.SYSTEM_ALERT,
  })
  type!: NotificationType;

  @ApiProperty({
    description: 'Alert title shown to the merchant.',
    example: 'Low stock: Mohinga',
  })
  title!: string;

  @ApiProperty({
    description: 'Alert body shown to the merchant.',
    example: 'Mohinga is now low in Downtown Branch with 2 left (threshold 3).',
  })
  body!: string;

  @ApiPropertyOptional({
    description: 'Merchant navigation path attached to the alert.',
    example: '/merchant/branches/branch_1/inventory/overview',
  })
  navigationPath!: string | null;

  @ApiProperty({
    description: 'Merchant user identifier that received the alert.',
    example: 'usr_merchant_1',
  })
  merchantUserId!: string;

  @ApiProperty({
    description: 'Merchant role attached to the alert notification.',
    enum: UserRole,
  })
  merchantRole!: UserRole;

  @ApiProperty({
    description: 'Merchant phone number.',
    example: '0999999999',
  })
  merchantPhone!: string;

  @ApiPropertyOptional({
    description: 'Branch identifier derived from the alert metadata.',
    example: 'branch_1',
  })
  branchId!: string | null;

  @ApiPropertyOptional({
    description: 'Branch display name derived from the alert metadata.',
    example: 'Downtown Branch',
  })
  branchName!: string | null;

  @ApiProperty({
    description: 'Inventory alert kind derived from the alert metadata.',
    enum: AdminInventoryAlertKind,
    example: AdminInventoryAlertKind.ATTENTION,
  })
  alertKind!: AdminInventoryAlertKind;

  @ApiProperty({
    description: 'Inventory resource type attached to the alert.',
    example: 'MENU_ITEM',
  })
  resourceType!: 'MENU_ITEM' | 'ITEM_OPTION';

  @ApiProperty({
    description: 'Inventory resource identifier attached to the alert.',
    example: 'item_1',
  })
  resourceId!: string;

  @ApiProperty({
    description: 'Inventory resource label attached to the alert.',
    example: 'Mohinga',
  })
  resourceLabel!: string;

  @ApiPropertyOptional({
    description: 'Parent menu item name when the alert is about an item option.',
    example: 'Mohinga',
  })
  menuItemName!: string | null;

  @ApiPropertyOptional({
    description:
      'Inventory attention level attached to shortage alerts. Null for compensation alerts.',
    enum: ['LOW_STOCK', 'OUT_OF_STOCK'],
    example: 'LOW_STOCK',
    nullable: true,
  })
  attentionLevel!: 'LOW_STOCK' | 'OUT_OF_STOCK' | null;

  @ApiProperty({
    description: 'Current stock quantity included with the alert.',
    example: 2,
    nullable: true,
  })
  stockQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Configured low-stock threshold included with the alert.',
    example: 3,
  })
  lowStockThreshold!: number | null;

  @ApiPropertyOptional({
    description:
      'Restored quantity included with compensation alerts. Null for shortage alerts.',
    example: 2,
    nullable: true,
  })
  restoredQuantity!: number | null;

  @ApiPropertyOptional({
    description: 'Order identifier attached to a compensation alert when available.',
    example: 'order_1',
  })
  orderId!: string | null;

  @ApiPropertyOptional({
    description: 'Order code attached to a compensation alert when available.',
    example: 'ORD-00000001',
  })
  orderCode!: string | null;

  @ApiPropertyOptional({
    description:
      'Reason code that triggered a compensation alert when available.',
    example: 'payment_failed',
  })
  reasonCode!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the merchant marked the notification as read.',
    example: '2026-05-01T10:05:00.000Z',
  })
  merchantReadAt!: string | null;

  @ApiProperty({
    description: 'Administrative acknowledgement status for the alert.',
    enum: AdminInventoryAlertStatus,
  })
  status!: AdminInventoryAlertStatus;

  @ApiPropertyOptional({
    description: 'Optional acknowledgement note recorded by the administrator.',
    example: 'Ops team contacted merchant for a restock update.',
  })
  acknowledgementNote!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the alert was acknowledged by an administrator.',
    example: '2026-05-01T10:15:00.000Z',
  })
  acknowledgedAt!: string | null;

  @ApiPropertyOptional({
    description: 'Administrator summary for the acknowledgement actor.',
    type: AdminInventoryAlertAcknowledgerDto,
  })
  acknowledgedBy!: AdminInventoryAlertAcknowledgerDto | null;

  @ApiPropertyOptional({
    description:
      'Optional lifecycle note recorded for the current alert status.',
    example: 'Restock confirmed; closing alert.',
  })
  statusNote!: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the current alert status was last set.',
    example: '2026-05-01T10:20:00.000Z',
  })
  statusChangedAt!: string | null;

  @ApiPropertyOptional({
    description:
      'Administrator summary for the actor who set the current alert status.',
    type: AdminInventoryAlertAcknowledgerDto,
  })
  statusChangedBy!: AdminInventoryAlertAcknowledgerDto | null;

  @ApiProperty({
    description: 'Alert creation timestamp.',
    example: '2026-05-01T10:00:00.000Z',
  })
  createdAt!: string;
}
