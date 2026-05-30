import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  AdminInventoryAlertKind,
  AdminInventoryAlertStatus,
} from '../../notifications/dto/admin-inventory-alert.dto';
import {
  AdminInventoryAlertMetadata,
  readAdminInventoryAlertMetadata,
} from '../../notifications/entities/admin-inventory-alert-notification.entity';
import {
  AdminInventoryAlertOverviewReportDto,
  AdminInventoryAlertReportBranchSummaryDto,
} from '../dto/admin-inventory-alert-overview-report.dto';
import {
  AdminInventoryAlertTrendBucketDto,
  AdminInventoryAlertTrendsReportDto,
} from '../dto/admin-inventory-alert-trends-report.dto';
import {
  adminInventoryAlertReportMaxDays,
  ListAdminInventoryAlertReportQueryDto,
} from '../dto/list-admin-inventory-alert-report-query.dto';

const inventoryAlertAcknowledgementAction = 'inventory_alerts.acknowledged';
const inventoryAlertResolutionAction = 'inventory_alerts.resolved';
const inventoryAlertDismissalAction = 'inventory_alerts.dismissed';
const inventoryAlertReminderAction = 'inventory_alerts.reminder_sent';
const inventoryAlertEscalationAction = 'inventory_alerts.escalated';

const inventoryAlertReportNotificationSelect =
  Prisma.validator<Prisma.NotificationSelect>()({
    id: true,
    userId: true,
    type: true,
    readAt: true,
    createdAt: true,
    metadataJson: true,
    deliveries: {
      select: {
        channel: true,
        status: true,
      },
    },
  });

type InventoryAlertReportNotificationRecord = Prisma.NotificationGetPayload<{
  select: typeof inventoryAlertReportNotificationSelect;
}>;

type InventoryAlertReportLifecycleLog = Awaited<
  ReturnType<AuditService['listInventoryAlertLifecycleLogs']>
>[number];

type InventoryAlertReportFollowUpLog = Awaited<
  ReturnType<AuditService['listInventoryAlertFollowUpLogs']>
>[number];

type ResolvedInventoryAlertReportRecord = {
  notificationId: string;
  merchantUserId: string;
  readAt: Date | null;
  createdAt: Date;
  metadata: AdminInventoryAlertMetadata;
  status: AdminInventoryAlertStatus;
  deliveries: InventoryAlertReportNotificationRecord['deliveries'];
  followUpLogs: InventoryAlertReportFollowUpLog[];
};

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getInventoryAlertOverview(
    currentUser: AuthenticatedUserEntity,
    query: ListAdminInventoryAlertReportQueryDto,
  ): Promise<AdminInventoryAlertOverviewReportDto> {
    this.assertAdmin(currentUser);

    const analyticsWindow = await this.loadInventoryAlertAnalyticsWindow(query);
    const kindCounts = {
      attentionAlertsCount: 0,
      compensationAlertsCount: 0,
    };
    const statusCounts = {
      openAlertsCount: 0,
      acknowledgedAlertsCount: 0,
      resolvedAlertsCount: 0,
      dismissedAlertsCount: 0,
    };
    const attentionLevelCounts = {
      lowStockAlertsCount: 0,
      outOfStockAlertsCount: 0,
    };
    const resourceTypeCounts = {
      menuItemAlertsCount: 0,
      itemOptionAlertsCount: 0,
    };
    const followUpCounts = {
      reminderCount: 0,
      escalationCount: 0,
    };
    const deliveryCounts = {
      pushPendingCount: 0,
      pushQueuedCount: 0,
      pushSentCount: 0,
      pushDeliveredCount: 0,
      pushFailedCount: 0,
    };
    const branchMap = new Map<
      string,
      AdminInventoryAlertReportBranchSummaryDto
    >();
    let unreadMerchantAlertsCount = 0;

    for (const alert of analyticsWindow.alerts) {
      if (alert.readAt === null) {
        unreadMerchantAlertsCount += 1;
      }

      if (alert.metadata.alertKind === 'ATTENTION') {
        kindCounts.attentionAlertsCount += 1;
      } else {
        kindCounts.compensationAlertsCount += 1;
      }

      switch (alert.status) {
        case AdminInventoryAlertStatus.ACKNOWLEDGED:
          statusCounts.acknowledgedAlertsCount += 1;
          break;
        case AdminInventoryAlertStatus.RESOLVED:
          statusCounts.resolvedAlertsCount += 1;
          break;
        case AdminInventoryAlertStatus.DISMISSED:
          statusCounts.dismissedAlertsCount += 1;
          break;
        default:
          statusCounts.openAlertsCount += 1;
          break;
      }

      if (alert.metadata.attentionLevel === 'LOW_STOCK') {
        attentionLevelCounts.lowStockAlertsCount += 1;
      } else if (alert.metadata.attentionLevel === 'OUT_OF_STOCK') {
        attentionLevelCounts.outOfStockAlertsCount += 1;
      }

      if (alert.metadata.resourceType === 'MENU_ITEM') {
        resourceTypeCounts.menuItemAlertsCount += 1;
      } else {
        resourceTypeCounts.itemOptionAlertsCount += 1;
      }

      for (const followUpLog of alert.followUpLogs) {
        if (followUpLog.action === inventoryAlertReminderAction) {
          followUpCounts.reminderCount += 1;
        } else if (followUpLog.action === inventoryAlertEscalationAction) {
          followUpCounts.escalationCount += 1;
        }
      }

      for (const delivery of alert.deliveries) {
        if (delivery.channel !== NotificationChannel.PUSH) {
          continue;
        }

        switch (delivery.status) {
          case NotificationDeliveryStatus.PENDING:
            deliveryCounts.pushPendingCount += 1;
            break;
          case NotificationDeliveryStatus.QUEUED:
            deliveryCounts.pushQueuedCount += 1;
            break;
          case NotificationDeliveryStatus.SENT:
            deliveryCounts.pushSentCount += 1;
            break;
          case NotificationDeliveryStatus.DELIVERED:
            deliveryCounts.pushDeliveredCount += 1;
            break;
          case NotificationDeliveryStatus.FAILED:
            deliveryCounts.pushFailedCount += 1;
            break;
        }
      }

      const branchKey = alert.metadata.branchId ?? '__unscoped__';
      const branchSummary = branchMap.get(branchKey) ?? {
        branchId: alert.metadata.branchId,
        branchName: alert.metadata.branchName,
        totalAlertsCount: 0,
        openLifecycleAlertsCount: 0,
        escalatedAlertsCount: 0,
      };

      branchSummary.totalAlertsCount += 1;

      if (
        alert.status === AdminInventoryAlertStatus.OPEN ||
        alert.status === AdminInventoryAlertStatus.ACKNOWLEDGED
      ) {
        branchSummary.openLifecycleAlertsCount += 1;
      }

      branchSummary.escalatedAlertsCount += alert.followUpLogs.filter(
        (log) => log.action === inventoryAlertEscalationAction,
      ).length;

      branchMap.set(branchKey, branchSummary);
    }

    return {
      generatedAt: analyticsWindow.generatedAt.toISOString(),
      windowStartedAt: analyticsWindow.windowStartedAt.toISOString(),
      windowEndedAt: analyticsWindow.windowEndedAt.toISOString(),
      periodDays: analyticsWindow.periodDays,
      totalAlertsCount: analyticsWindow.alerts.length,
      unreadMerchantAlertsCount,
      kindCounts,
      statusCounts,
      attentionLevelCounts,
      resourceTypeCounts,
      followUpCounts,
      deliveryCounts,
      topBranches: [...branchMap.values()]
        .sort((left, right) => {
          if (right.totalAlertsCount !== left.totalAlertsCount) {
            return right.totalAlertsCount - left.totalAlertsCount;
          }

          if (right.openLifecycleAlertsCount !== left.openLifecycleAlertsCount) {
            return right.openLifecycleAlertsCount - left.openLifecycleAlertsCount;
          }

          return (left.branchName ?? '').localeCompare(right.branchName ?? '');
        })
        .slice(0, 5),
    };
  }

  async getInventoryAlertTrends(
    currentUser: AuthenticatedUserEntity,
    query: ListAdminInventoryAlertReportQueryDto,
  ): Promise<AdminInventoryAlertTrendsReportDto> {
    this.assertAdmin(currentUser);

    const analyticsWindow = await this.loadInventoryAlertAnalyticsWindow(query);
    const bucketMap = new Map<string, AdminInventoryAlertTrendBucketDto>();

    for (let offset = 0; offset < analyticsWindow.periodDays; offset += 1) {
      const bucketDate = new Date(analyticsWindow.windowStartedAt);
      bucketDate.setUTCDate(bucketDate.getUTCDate() + offset);
      const bucketKey = this.toUtcDateKey(bucketDate);

      bucketMap.set(bucketKey, {
        date: bucketKey,
        createdAlertsCount: 0,
        attentionAlertsCount: 0,
        compensationAlertsCount: 0,
        unreadMerchantAlertsCount: 0,
        acknowledgedCount: 0,
        resolvedCount: 0,
        dismissedCount: 0,
        reminderCount: 0,
        escalationCount: 0,
      });
    }

    for (const alert of analyticsWindow.alerts) {
      const bucket = bucketMap.get(this.toUtcDateKey(alert.createdAt));

      if (bucket === undefined) {
        continue;
      }

      bucket.createdAlertsCount += 1;

      if (alert.metadata.alertKind === 'ATTENTION') {
        bucket.attentionAlertsCount += 1;
      } else {
        bucket.compensationAlertsCount += 1;
      }

      if (alert.readAt === null) {
        bucket.unreadMerchantAlertsCount += 1;
      }
    }

    for (const lifecycleLog of analyticsWindow.lifecycleLogs) {
      const bucket = bucketMap.get(this.toUtcDateKey(new Date(lifecycleLog.createdAt)));

      if (bucket === undefined) {
        continue;
      }

      switch (lifecycleLog.action) {
        case inventoryAlertAcknowledgementAction:
          bucket.acknowledgedCount += 1;
          break;
        case inventoryAlertResolutionAction:
          bucket.resolvedCount += 1;
          break;
        case inventoryAlertDismissalAction:
          bucket.dismissedCount += 1;
          break;
      }
    }

    for (const followUpLog of analyticsWindow.followUpLogs) {
      const bucket = bucketMap.get(this.toUtcDateKey(new Date(followUpLog.createdAt)));

      if (bucket === undefined) {
        continue;
      }

      if (followUpLog.action === inventoryAlertReminderAction) {
        bucket.reminderCount += 1;
      } else if (followUpLog.action === inventoryAlertEscalationAction) {
        bucket.escalationCount += 1;
      }
    }

    return {
      generatedAt: analyticsWindow.generatedAt.toISOString(),
      windowStartedAt: analyticsWindow.windowStartedAt.toISOString(),
      windowEndedAt: analyticsWindow.windowEndedAt.toISOString(),
      periodDays: analyticsWindow.periodDays,
      buckets: [...bucketMap.values()],
    };
  }

  private async loadInventoryAlertAnalyticsWindow(
    query: ListAdminInventoryAlertReportQueryDto,
  ) {
    const generatedAt = new Date();
    const periodDays = this.normalizePeriodDays(query.days);
    const windowStartedAt = this.buildWindowStart(generatedAt, periodDays);
    const notifications = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.SYSTEM_ALERT,
        createdAt: {
          gte: windowStartedAt,
        },
      },
      select: inventoryAlertReportNotificationSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const alerts = notifications
      .map((notification) => this.toResolvedInventoryAlert(notification))
      .filter(
        (
          alert,
        ): alert is Omit<
          ResolvedInventoryAlertReportRecord,
          'status' | 'followUpLogs'
        > => alert !== null,
      )
      .filter((alert) => {
        if (
          query.branchId !== undefined &&
          query.branchId.trim().length > 0 &&
          alert.metadata.branchId !== query.branchId.trim()
        ) {
          return false;
        }

        if (
          query.merchantUserId !== undefined &&
          query.merchantUserId.trim().length > 0 &&
          alert.merchantUserId !== query.merchantUserId.trim()
        ) {
          return false;
        }

        return true;
      });
    const notificationIds = alerts.map((alert) => alert.notificationId);
    const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(
      notificationIds,
    );
    const followUpLogs = await this.auditService.listInventoryAlertFollowUpLogs(
      notificationIds,
    );
    const latestLifecycleByNotificationId =
      this.buildLatestLifecycleLogMap(lifecycleLogs);
    const followUpLogsByNotificationId = this.buildFollowUpLogMap(followUpLogs);

    return {
      generatedAt,
      periodDays,
      windowStartedAt,
      windowEndedAt: generatedAt,
      alerts: alerts.map((alert) => ({
        ...alert,
        status: this.resolveInventoryAlertStatus(
          latestLifecycleByNotificationId.get(alert.notificationId) ?? null,
        ),
        followUpLogs:
          followUpLogsByNotificationId.get(alert.notificationId) ?? [],
      })),
      lifecycleLogs,
      followUpLogs,
    };
  }

  private toResolvedInventoryAlert(
    notification: InventoryAlertReportNotificationRecord,
  ): Omit<ResolvedInventoryAlertReportRecord, 'status' | 'followUpLogs'> | null {
    const metadata = readAdminInventoryAlertMetadata(notification);

    if (metadata === null) {
      return null;
    }

    return {
      notificationId: notification.id,
      merchantUserId: notification.userId,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      metadata,
      deliveries: notification.deliveries,
    };
  }

  private buildLatestLifecycleLogMap(logs: InventoryAlertReportLifecycleLog[]) {
    const latestLifecycleByNotificationId = new Map<
      string,
      InventoryAlertReportLifecycleLog
    >();

    for (const lifecycleLog of logs) {
      if (!latestLifecycleByNotificationId.has(lifecycleLog.resourceId)) {
        latestLifecycleByNotificationId.set(lifecycleLog.resourceId, lifecycleLog);
      }
    }

    return latestLifecycleByNotificationId;
  }

  private buildFollowUpLogMap(logs: InventoryAlertReportFollowUpLog[]) {
    const followUpLogsByNotificationId = new Map<
      string,
      InventoryAlertReportFollowUpLog[]
    >();

    for (const followUpLog of logs) {
      const list = followUpLogsByNotificationId.get(followUpLog.resourceId) ?? [];
      list.push(followUpLog);
      followUpLogsByNotificationId.set(followUpLog.resourceId, list);
    }

    return followUpLogsByNotificationId;
  }

  private resolveInventoryAlertStatus(
    lifecycleLog: InventoryAlertReportLifecycleLog | null,
  ): AdminInventoryAlertStatus {
    switch (lifecycleLog?.action) {
      case inventoryAlertDismissalAction:
        return AdminInventoryAlertStatus.DISMISSED;
      case inventoryAlertResolutionAction:
        return AdminInventoryAlertStatus.RESOLVED;
      case inventoryAlertAcknowledgementAction:
        return AdminInventoryAlertStatus.ACKNOWLEDGED;
      default:
        return AdminInventoryAlertStatus.OPEN;
    }
  }

  private buildWindowStart(now: Date, days: number): Date {
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    start.setUTCDate(start.getUTCDate() - (days - 1));

    return start;
  }

  private normalizePeriodDays(days: number | undefined): number {
    if (days === undefined) {
      return 7;
    }

    return Math.min(Math.max(days, 1), adminInventoryAlertReportMaxDays);
  }

  private toUtcDateKey(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private assertAdmin(currentUser: AuthenticatedUserEntity): void {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    throw new AppException(
      'You are not allowed to read administrative reports.',
      HttpStatus.FORBIDDEN,
      {
        code: ErrorCodes.forbidden,
      },
    );
  }
}
