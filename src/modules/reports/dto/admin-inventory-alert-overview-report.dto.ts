import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminInventoryAlertReportKindCountsDto {
  @ApiProperty({
    description: 'Number of shortage-style attention alerts in the report window.',
    example: 12,
  })
  attentionAlertsCount!: number;

  @ApiProperty({
    description:
      'Number of compensation alerts generated from inventory restoration events.',
    example: 4,
  })
  compensationAlertsCount!: number;
}

export class AdminInventoryAlertReportStatusCountsDto {
  @ApiProperty({
    description: 'Number of alerts that are still open.',
    example: 6,
  })
  openAlertsCount!: number;

  @ApiProperty({
    description: 'Number of alerts that were acknowledged by admins.',
    example: 2,
  })
  acknowledgedAlertsCount!: number;

  @ApiProperty({
    description: 'Number of alerts resolved by admins or system lifecycle rules.',
    example: 5,
  })
  resolvedAlertsCount!: number;

  @ApiProperty({
    description: 'Number of alerts dismissed by admins.',
    example: 1,
  })
  dismissedAlertsCount!: number;
}

export class AdminInventoryAlertReportAttentionLevelCountsDto {
  @ApiProperty({
    description: 'Number of low-stock attention alerts in the report window.',
    example: 8,
  })
  lowStockAlertsCount!: number;

  @ApiProperty({
    description: 'Number of out-of-stock attention alerts in the report window.',
    example: 4,
  })
  outOfStockAlertsCount!: number;
}

export class AdminInventoryAlertReportResourceTypeCountsDto {
  @ApiProperty({
    description: 'Number of alerts attached to menu items.',
    example: 10,
  })
  menuItemAlertsCount!: number;

  @ApiProperty({
    description: 'Number of alerts attached to item options.',
    example: 6,
  })
  itemOptionAlertsCount!: number;
}

export class AdminInventoryAlertReportFollowUpCountsDto {
  @ApiProperty({
    description: 'Number of reminder follow-up audit events in the report window.',
    example: 3,
  })
  reminderCount!: number;

  @ApiProperty({
    description:
      'Number of escalation follow-up audit events in the report window.',
    example: 1,
  })
  escalationCount!: number;
}

export class AdminInventoryAlertReportDeliveryCountsDto {
  @ApiProperty({
    description: 'Number of pending push delivery attempts in the report window.',
    example: 1,
  })
  pushPendingCount!: number;

  @ApiProperty({
    description: 'Number of queued push delivery attempts in the report window.',
    example: 2,
  })
  pushQueuedCount!: number;

  @ApiProperty({
    description: 'Number of sent push delivery attempts in the report window.',
    example: 9,
  })
  pushSentCount!: number;

  @ApiProperty({
    description:
      'Number of delivered push delivery attempts in the report window.',
    example: 7,
  })
  pushDeliveredCount!: number;

  @ApiProperty({
    description: 'Number of failed push delivery attempts in the report window.',
    example: 2,
  })
  pushFailedCount!: number;
}

export class AdminInventoryAlertReportBranchSummaryDto {
  @ApiPropertyOptional({
    description: 'Branch identifier derived from alert metadata.',
    example: 'branch_1',
    nullable: true,
  })
  branchId!: string | null;

  @ApiPropertyOptional({
    description: 'Branch name derived from alert metadata.',
    example: 'Downtown Branch',
    nullable: true,
  })
  branchName!: string | null;

  @ApiProperty({
    description: 'Total number of alerts in the report window for this branch.',
    example: 8,
  })
  totalAlertsCount!: number;

  @ApiProperty({
    description:
      'Number of currently open or acknowledged alerts for this branch.',
    example: 3,
  })
  openLifecycleAlertsCount!: number;

  @ApiProperty({
    description: 'Number of escalation follow-up events for this branch.',
    example: 1,
  })
  escalatedAlertsCount!: number;
}

export class AdminInventoryAlertOverviewReportDto {
  @ApiProperty({
    description: 'Timestamp when the analytics snapshot was generated.',
    example: '2026-05-02T12:00:00.000Z',
  })
  generatedAt!: string;

  @ApiProperty({
    description: 'Inclusive UTC start of the analytics window.',
    example: '2026-04-26T00:00:00.000Z',
  })
  windowStartedAt!: string;

  @ApiProperty({
    description: 'Current UTC time used as the report window end.',
    example: '2026-05-02T12:00:00.000Z',
  })
  windowEndedAt!: string;

  @ApiProperty({
    description: 'Number of trailing UTC days included in the snapshot.',
    example: 7,
  })
  periodDays!: number;

  @ApiProperty({
    description: 'Total number of inventory alerts in the analytics window.',
    example: 16,
  })
  totalAlertsCount!: number;

  @ApiProperty({
    description:
      'Number of inventory alerts the merchant has not marked as read yet.',
    example: 5,
  })
  unreadMerchantAlertsCount!: number;

  @ApiProperty({
    description: 'Counts split by alert kind.',
    type: AdminInventoryAlertReportKindCountsDto,
  })
  kindCounts!: AdminInventoryAlertReportKindCountsDto;

  @ApiProperty({
    description: 'Counts split by current lifecycle status.',
    type: AdminInventoryAlertReportStatusCountsDto,
  })
  statusCounts!: AdminInventoryAlertReportStatusCountsDto;

  @ApiProperty({
    description: 'Counts split by shortage attention level.',
    type: AdminInventoryAlertReportAttentionLevelCountsDto,
  })
  attentionLevelCounts!: AdminInventoryAlertReportAttentionLevelCountsDto;

  @ApiProperty({
    description: 'Counts split by alert resource type.',
    type: AdminInventoryAlertReportResourceTypeCountsDto,
  })
  resourceTypeCounts!: AdminInventoryAlertReportResourceTypeCountsDto;

  @ApiProperty({
    description: 'Counts split by follow-up action type.',
    type: AdminInventoryAlertReportFollowUpCountsDto,
  })
  followUpCounts!: AdminInventoryAlertReportFollowUpCountsDto;

  @ApiProperty({
    description: 'Push delivery attempt status counts for the same alert window.',
    type: AdminInventoryAlertReportDeliveryCountsDto,
  })
  deliveryCounts!: AdminInventoryAlertReportDeliveryCountsDto;

  @ApiProperty({
    description: 'Top branches by alert volume in the analytics window.',
    type: AdminInventoryAlertReportBranchSummaryDto,
    isArray: true,
  })
  topBranches!: AdminInventoryAlertReportBranchSummaryDto[];
}
