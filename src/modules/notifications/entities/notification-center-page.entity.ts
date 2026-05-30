import { ApiProperty } from '@nestjs/swagger';

import { NotificationCenterEntity } from './notification-center.entity';

export class NotificationCenterPageEntity {
  @ApiProperty({
    example: 'notification_20',
    nullable: true,
  })
  nextCursor!: string | null;

  @ApiProperty({ example: true })
  hasMore!: boolean;

  @ApiProperty({
    example: 'INVENTORY_OPEN',
    nullable: true,
  })
  appliedPreset!: string | null;

  @ApiProperty({ example: '2026-05-02T08:00:00.000Z' })
  generatedAt!: string;

  @ApiProperty({ example: 30 })
  cacheTtlSeconds!: number;

  @ApiProperty({ example: 15 })
  suggestedPollIntervalSeconds!: number;

  @ApiProperty({ type: NotificationCenterEntity, isArray: true })
  notifications!: NotificationCenterEntity[];
}

export function buildNotificationCenterPage(input: {
  nextCursor: string | null;
  hasMore: boolean;
  appliedPreset: string | null;
  generatedAt: string;
  cacheTtlSeconds: number;
  suggestedPollIntervalSeconds: number;
  notifications: NotificationCenterEntity[];
}): NotificationCenterPageEntity {
  return {
    nextCursor: input.nextCursor,
    hasMore: input.hasMore,
    appliedPreset: input.appliedPreset,
    generatedAt: input.generatedAt,
    cacheTtlSeconds: input.cacheTtlSeconds,
    suggestedPollIntervalSeconds: input.suggestedPollIntervalSeconds,
    notifications: input.notifications,
  };
}
