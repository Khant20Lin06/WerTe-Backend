import { ApiProperty } from '@nestjs/swagger';

export class AdminInventoryAlertTrendBucketDto {
  @ApiProperty({
    description: 'UTC calendar date bucket in YYYY-MM-DD format.',
    example: '2026-05-02',
  })
  date!: string;

  @ApiProperty({
    description: 'Number of inventory alerts created on this UTC date.',
    example: 4,
  })
  createdAlertsCount!: number;

  @ApiProperty({
    description: 'Number of attention alerts created on this UTC date.',
    example: 3,
  })
  attentionAlertsCount!: number;

  @ApiProperty({
    description: 'Number of compensation alerts created on this UTC date.',
    example: 1,
  })
  compensationAlertsCount!: number;

  @ApiProperty({
    description:
      'Number of alerts created on this date that remain unread by merchants.',
    example: 2,
  })
  unreadMerchantAlertsCount!: number;

  @ApiProperty({
    description:
      'Number of acknowledgement lifecycle events recorded on this UTC date.',
    example: 1,
  })
  acknowledgedCount!: number;

  @ApiProperty({
    description:
      'Number of resolution lifecycle events recorded on this UTC date.',
    example: 2,
  })
  resolvedCount!: number;

  @ApiProperty({
    description:
      'Number of dismissal lifecycle events recorded on this UTC date.',
    example: 1,
  })
  dismissedCount!: number;

  @ApiProperty({
    description: 'Number of reminder follow-up events recorded on this UTC date.',
    example: 1,
  })
  reminderCount!: number;

  @ApiProperty({
    description:
      'Number of escalation follow-up events recorded on this UTC date.',
    example: 0,
  })
  escalationCount!: number;
}

export class AdminInventoryAlertTrendsReportDto {
  @ApiProperty({
    description: 'Timestamp when the trend report was generated.',
    example: '2026-05-02T12:00:00.000Z',
  })
  generatedAt!: string;

  @ApiProperty({
    description: 'Inclusive UTC start of the trend window.',
    example: '2026-04-26T00:00:00.000Z',
  })
  windowStartedAt!: string;

  @ApiProperty({
    description: 'Current UTC time used as the trend window end.',
    example: '2026-05-02T12:00:00.000Z',
  })
  windowEndedAt!: string;

  @ApiProperty({
    description: 'Number of trailing UTC days included in the trend window.',
    example: 7,
  })
  periodDays!: number;

  @ApiProperty({
    description: 'UTC date buckets covering the requested analytics window.',
    type: AdminInventoryAlertTrendBucketDto,
    isArray: true,
  })
  buckets!: AdminInventoryAlertTrendBucketDto[];
}
