import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
  UserRole,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../../infrastructure/logging/app.logger';
import {
  QueueJobNames,
  QueueNames,
} from '../../../infrastructure/queue/queue.constants';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { AuditLogEntity } from '../../audit/entities/audit-log.entity';
import { AuditService } from '../../audit/services/audit.service';
import { UsersService } from '../../users/services/users.service';
import {
  AdminInventoryAlertMetadata,
  AdminInventoryAlertNotificationRecord,
  readAdminInventoryAlertMetadata,
} from '../entities/admin-inventory-alert-notification.entity';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationsService } from './notifications.service';

type ReminderCandidate = {
  notification: AdminInventoryAlertNotificationRecord;
  metadata: AdminInventoryAlertMetadata;
  status: 'OPEN' | 'ACKNOWLEDGED';
};

type InventoryAlertDigestRunResult = {
  attentionAlertsScanned: number;
  merchantReminderDigestCount: number;
  reminderSourceAlertCount: number;
  adminEscalationDigestCount: number;
  escalationSourceAlertCount: number;
};

const inventoryAlertReminderAction = 'inventory_alerts.reminder_sent';
const inventoryAlertEscalationAction = 'inventory_alerts.escalated';

@Injectable()
export class NotificationAlertDigestService {
  private static readonly scanLimit = 500;
  private static readonly merchantReminderAgeMs = 30 * 60 * 1000;
  private static readonly merchantReminderCooldownMs = 6 * 60 * 60 * 1000;
  private static readonly adminEscalationAgeMs = 2 * 60 * 60 * 1000;
  private static readonly adminEscalationCooldownMs = 12 * 60 * 60 * 1000;

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
    private readonly queueService: QueueService,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
    private readonly logger: AppLogger,
  ) {}

  async runDigestCycle(at = new Date()): Promise<InventoryAlertDigestRunResult> {
    const notifications =
      await this.notificationsRepository.listRecentInventoryAlerts(
        NotificationAlertDigestService.scanLimit,
      );
    const attentionAlerts = notifications
      .map((notification) => ({
        notification,
        metadata: readAdminInventoryAlertMetadata(notification),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          notification: AdminInventoryAlertNotificationRecord;
          metadata: AdminInventoryAlertMetadata;
        } =>
          candidate.metadata !== null &&
          candidate.metadata.alertKind === 'ATTENTION',
      );
    const lifecycleLogs = await this.auditService.listInventoryAlertLifecycleLogs(
      attentionAlerts.map(({ notification }) => notification.id),
    );
    const latestLifecycleByNotificationId =
      this.buildLatestLifecycleLogMap(lifecycleLogs);
    const followUpLogs = await this.auditService.listInventoryAlertFollowUpLogs(
      attentionAlerts.map(({ notification }) => notification.id),
    );
    const latestReminderLogByNotificationId = this.buildLatestActionLogMap(
      followUpLogs,
      inventoryAlertReminderAction,
    );
    const latestEscalationLogByNotificationId = this.buildLatestActionLogMap(
      followUpLogs,
      inventoryAlertEscalationAction,
    );
    const unresolvedAttentionAlerts = attentionAlerts
      .map(({ notification, metadata }) => ({
        notification,
        metadata,
        status: this.resolveInventoryAlertStatus(
          latestLifecycleByNotificationId.get(notification.id) ?? null,
        ),
      }))
      .filter(
        (
          candidate,
        ): candidate is ReminderCandidate =>
          candidate.status === 'OPEN' || candidate.status === 'ACKNOWLEDGED',
      );
    const merchantReminderCandidates = unresolvedAttentionAlerts.filter(
      ({ notification }) =>
        this.isOlderThan(
          notification.createdAt,
          NotificationAlertDigestService.merchantReminderAgeMs,
          at,
        ) &&
        !this.hasRecentLog(
          latestReminderLogByNotificationId.get(notification.id) ?? null,
          NotificationAlertDigestService.merchantReminderCooldownMs,
          at,
        ),
    );
    const adminEscalationCandidates = unresolvedAttentionAlerts.filter(
      ({ notification }) =>
        this.isOlderThan(
          notification.createdAt,
          NotificationAlertDigestService.adminEscalationAgeMs,
          at,
        ) &&
        !this.hasRecentLog(
          latestEscalationLogByNotificationId.get(notification.id) ?? null,
          NotificationAlertDigestService.adminEscalationCooldownMs,
          at,
        ),
    );
    const merchantReminderGroups = this.groupByMerchantAndBranch(
      merchantReminderCandidates,
    );
    const adminEscalationGroups = this.groupByMerchantAndBranch(
      adminEscalationCandidates,
    );
    let merchantReminderDigestCount = 0;
    let reminderSourceAlertCount = 0;

    for (const group of merchantReminderGroups) {
      const reminderNotification = await this.notificationsService.createNotification({
        userId: group.merchantUserId,
        type: NotificationType.SUPPORT_UPDATE,
        title: this.buildMerchantReminderTitle(group),
        body: this.buildMerchantReminderBody(group),
        navigationPath: `/merchant/branches/${group.branchId}/inventory/overview`,
        metadataJson: {
          digestKind: 'MERCHANT_INVENTORY_REMINDER',
          branchId: group.branchId,
          branchName: group.branchName,
          alertNotificationIds: group.alerts.map(({ notification }) => notification.id),
          attentionAlertCount: group.alerts.length,
          oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
        },
      });

      await this.recordMerchantReminderDeliveries(
        reminderNotification.notificationId,
        group.merchantUserId,
        at,
      );

      for (const { notification, metadata } of group.alerts) {
        await this.auditService.logAction({
          actorType: AuditActorType.SYSTEM,
          actorUserId: null,
          actorRole: null,
          actionSource: AuditActionSource.JOB,
          action: inventoryAlertReminderAction,
          resourceType: AuditResourceType.NOTIFICATION,
          resourceId: notification.id,
          resourceLabel: notification.title,
          targetUserId: group.merchantUserId,
          branchId: metadata.branchId,
          metadataJson: {
            reminderNotificationId: reminderNotification.notificationId,
            digestKind: 'MERCHANT_INVENTORY_REMINDER',
            attentionAlertCount: group.alerts.length,
            oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
          },
        });
      }

      merchantReminderDigestCount += 1;
      reminderSourceAlertCount += group.alerts.length;
    }

    const activeOpsUsers = adminEscalationGroups.length
      ? await this.usersService.listActiveByRoles([UserRole.ADMIN, UserRole.SUPPORT])
      : [];
    let adminEscalationDigestCount = 0;
    let escalationSourceAlertCount = 0;

    for (const group of adminEscalationGroups) {
      if (activeOpsUsers.length === 0) {
        break;
      }

      const escalationNotificationIds: string[] = [];

      for (const user of activeOpsUsers) {
        const notification = await this.notificationsService.createNotification({
          userId: user.id,
          type: NotificationType.SUPPORT_UPDATE,
          title: this.buildAdminEscalationTitle(group),
          body: this.buildAdminEscalationBody(group, at),
          navigationPath: `/admin/inventory-alerts?status=OPEN&branchId=${group.branchId}`,
          metadataJson: {
            digestKind: 'ADMIN_INVENTORY_ESCALATION',
            branchId: group.branchId,
            branchName: group.branchName,
            merchantUserId: group.merchantUserId,
            merchantPhone: group.merchantPhone,
            alertNotificationIds: group.alerts.map(
              ({ notification: alertNotification }) => alertNotification.id,
            ),
            attentionAlertCount: group.alerts.length,
            oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
          },
        });

        await this.notificationsService.createDeliveryAttempt({
          notificationId: notification.notificationId,
          channel: NotificationChannel.IN_APP,
          status: NotificationDeliveryStatus.DELIVERED,
          deliveredAt: at,
        });
        escalationNotificationIds.push(notification.notificationId);
      }

      for (const { notification, metadata } of group.alerts) {
        await this.auditService.logAction({
          actorType: AuditActorType.SYSTEM,
          actorUserId: null,
          actorRole: null,
          actionSource: AuditActionSource.JOB,
          action: inventoryAlertEscalationAction,
          resourceType: AuditResourceType.NOTIFICATION,
          resourceId: notification.id,
          resourceLabel: notification.title,
          targetUserId: null,
          branchId: metadata.branchId,
          metadataJson: {
            escalationNotificationIds,
            digestKind: 'ADMIN_INVENTORY_ESCALATION',
            attentionAlertCount: group.alerts.length,
            oldestAlertCreatedAt: this.resolveOldestCreatedAt(group.alerts),
            recipientCount: activeOpsUsers.length,
          },
        });
      }

      adminEscalationDigestCount += activeOpsUsers.length;
      escalationSourceAlertCount += group.alerts.length;
    }

    const result = {
      attentionAlertsScanned: attentionAlerts.length,
      merchantReminderDigestCount,
      reminderSourceAlertCount,
      adminEscalationDigestCount,
      escalationSourceAlertCount,
    } satisfies InventoryAlertDigestRunResult;

    this.logger.logEvent(
      'Inventory alert digest cycle processed.',
      result,
      'NotificationAlertDigestService',
    );

    return result;
  }

  private groupByMerchantAndBranch(alerts: ReminderCandidate[]) {
    const groups = new Map<
      string,
      {
        merchantUserId: string;
        merchantPhone: string;
        branchId: string;
        branchName: string;
        alerts: ReminderCandidate[];
      }
    >();

    for (const alert of alerts) {
      const branchId = alert.metadata.branchId ?? 'unknown_branch';
      const branchName = alert.metadata.branchName ?? branchId;
      const groupKey = `${alert.notification.user.id}::${branchId}`;
      const existing = groups.get(groupKey);

      if (existing === undefined) {
        groups.set(groupKey, {
          merchantUserId: alert.notification.user.id,
          merchantPhone: alert.notification.user.phone,
          branchId,
          branchName,
          alerts: [alert],
        });
        continue;
      }

      existing.alerts.push(alert);
    }

    return [...groups.values()];
  }

  private buildLatestLifecycleLogMap(logs: AuditLogEntity[]) {
    const latestLogsByNotificationId = new Map<string, AuditLogEntity>();

    for (const log of logs) {
      if (!latestLogsByNotificationId.has(log.resourceId)) {
        latestLogsByNotificationId.set(log.resourceId, log);
      }
    }

    return latestLogsByNotificationId;
  }

  private buildLatestActionLogMap(logs: AuditLogEntity[], action: string) {
    const latestLogsByNotificationId = new Map<string, AuditLogEntity>();

    for (const log of logs) {
      if (log.action !== action || latestLogsByNotificationId.has(log.resourceId)) {
        continue;
      }

      latestLogsByNotificationId.set(log.resourceId, log);
    }

    return latestLogsByNotificationId;
  }

  private resolveInventoryAlertStatus(
    lifecycleLog: AuditLogEntity | null,
  ): 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED' {
    switch (lifecycleLog?.action) {
      case 'inventory_alerts.dismissed':
        return 'DISMISSED';
      case 'inventory_alerts.resolved':
        return 'RESOLVED';
      case 'inventory_alerts.acknowledged':
        return 'ACKNOWLEDGED';
      default:
        return 'OPEN';
    }
  }

  private isOlderThan(
    createdAt: Date,
    ageMs: number,
    at: Date,
  ): boolean {
    return createdAt.getTime() <= at.getTime() - ageMs;
  }

  private hasRecentLog(
    log: AuditLogEntity | null,
    cooldownMs: number,
    at: Date,
  ): boolean {
    if (log === null) {
      return false;
    }

    return new Date(log.createdAt).getTime() >= at.getTime() - cooldownMs;
  }

  private buildMerchantReminderTitle(group: {
    branchName: string;
  }): string {
    return `Inventory reminder: ${group.branchName}`;
  }

  private buildMerchantReminderBody(group: {
    branchName: string;
    alerts: ReminderCandidate[];
  }): string {
    const labels = this.buildLabelPreview(group.alerts);
    const count = group.alerts.length;

    return count === 1
      ? `1 shortage alert still needs attention in ${group.branchName}: ${labels}.`
      : `${count} shortage alerts still need attention in ${group.branchName}: ${labels}.`;
  }

  private buildAdminEscalationTitle(group: {
    branchName: string;
  }): string {
    return `Inventory escalation: ${group.branchName}`;
  }

  private buildAdminEscalationBody(group: {
    branchName: string;
    merchantPhone: string;
    alerts: ReminderCandidate[];
  }, at: Date): string {
    const labels = this.buildLabelPreview(group.alerts);
    const oldestAlertAgeMinutes = Math.max(
      1,
      Math.floor(
        (at.getTime() -
          Math.min(
            ...group.alerts.map(({ notification }) => notification.createdAt.getTime()),
          )) /
          60_000,
      ),
    );
    const count = group.alerts.length;

    return count === 1
      ? `1 shortage alert has stayed unresolved in ${group.branchName} for about ${oldestAlertAgeMinutes} minutes (${labels}). Merchant: ${group.merchantPhone}.`
      : `${count} shortage alerts have stayed unresolved in ${group.branchName} for about ${oldestAlertAgeMinutes} minutes (${labels}). Merchant: ${group.merchantPhone}.`;
  }

  private buildLabelPreview(alerts: ReminderCandidate[]): string {
    const labels = alerts.map(({ metadata }) => metadata.resourceLabel);

    if (labels.length <= 3) {
      return labels.join(', ');
    }

    return `${labels.slice(0, 3).join(', ')} and ${labels.length - 3} more`;
  }

  private resolveOldestCreatedAt(alerts: ReminderCandidate[]): string {
    return new Date(
      Math.min(...alerts.map(({ notification }) => notification.createdAt.getTime())),
    ).toISOString();
  }

  private async recordMerchantReminderDeliveries(
    notificationId: string,
    merchantUserId: string,
    at: Date,
  ): Promise<void> {
    await this.notificationsService.createDeliveryAttempt({
      notificationId,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.DELIVERED,
      deliveredAt: at,
    });

    const shouldQueuePush =
      await this.notificationPreferencesService.shouldQueueMerchantInventoryAlertPush(
        merchantUserId,
        at,
      );

    if (!shouldQueuePush) {
      return;
    }

    await this.notificationsService.createDeliveryAttempt({
      notificationId,
      channel: NotificationChannel.PUSH,
      status: NotificationDeliveryStatus.QUEUED,
      queuedAt: at,
    });
    await this.queueService.add(
      QueueNames.notifications,
      QueueJobNames.notifications.pushNotification,
      {
        notificationId,
        attempt: 1,
      },
    );
  }
}
