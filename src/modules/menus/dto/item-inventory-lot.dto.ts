import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MenuItemInventoryLotRecord } from '../entities/menu-item-inventory-lot.entity';

export class ItemInventoryLotDto {
  @ApiProperty({ example: 'lot_1' })
  id!: string;

  @ApiProperty({ example: 'item_1' })
  menuItemId!: string;

  @ApiProperty({ example: 'BATCH-2026-001' })
  batchNo!: string;

  @ApiPropertyOptional({
    example: '2026-05-30T00:00:00.000Z',
    nullable: true,
  })
  expiryDate!: string | null;

  @ApiProperty({
    example: '2026-05-02T09:30:00.000Z',
  })
  receivedAt!: string;

  @ApiProperty({ example: 24 })
  receivedQuantity!: number;

  @ApiProperty({ example: 12 })
  remainingQuantity!: number;

  @ApiPropertyOptional({
    example: 'Initial pharmacy delivery',
    nullable: true,
  })
  note!: string | null;

  @ApiProperty({ example: false })
  isExpired!: boolean;

  @ApiProperty({ example: false })
  isDepleted!: boolean;

  @ApiProperty({ example: '2026-05-02T09:30:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-02T09:30:00.000Z' })
  updatedAt!: string;
}

export function toItemInventoryLotDto(
  lot: MenuItemInventoryLotRecord,
): ItemInventoryLotDto {
  return {
    id: lot.id,
    menuItemId: lot.menuItemId,
    batchNo: lot.batchNo,
    expiryDate: lot.expiryDate?.toISOString() ?? null,
    receivedAt: lot.receivedAt.toISOString(),
    receivedQuantity: lot.receivedQuantity,
    remainingQuantity: lot.remainingQuantity,
    note: lot.note ?? null,
    isExpired: lot.expiryDate !== null && lot.expiryDate.getTime() < Date.now(),
    isDepleted: lot.remainingQuantity <= 0,
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString(),
  };
}
