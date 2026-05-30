import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { auditLogInclude, AuditLogRecord } from '../entities/audit-log.entity';

const branchMenuScopeAuditActions = [
  'menu_categories.scope_created',
  'menu_categories.scope_updated',
  'menu_items.scope_created',
  'menu_items.scope_updated',
] as const;

const branchInventoryAdjustmentAuditActions = [
  'menu_items.inventory_adjusted',
  'item_options.inventory_adjusted',
] as const;

const inventoryAlertAcknowledgementAction = 'inventory_alerts.acknowledged' as const;
const inventoryAlertResolutionAction = 'inventory_alerts.resolved' as const;
const inventoryAlertDismissalAction = 'inventory_alerts.dismissed' as const;
const inventoryAlertReminderAction = 'inventory_alerts.reminder_sent' as const;
const inventoryAlertEscalationAction = 'inventory_alerts.escalated' as const;

type CreateAuditLogInput = {
  actorType?: AuditActorType;
  actorUserId?: string | null;
  actorRole?: UserRole | null;
  actionSource?: AuditActionSource;
  action: string;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceLabel?: string | null;
  targetUserId?: string | null;
  orderId?: string | null;
  deliveryId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  branchId?: string | null;
  metadataJson?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(payload: CreateAuditLogInput): Promise<AuditLogRecord> {
    return this.prisma.auditLog.create({
      data: {
        actorType: payload.actorType ?? AuditActorType.USER,
        actorUserId: payload.actorUserId ?? null,
        actorRole: payload.actorRole ?? null,
        actionSource: payload.actionSource ?? AuditActionSource.API,
        action: payload.action,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        resourceLabel: payload.resourceLabel ?? null,
        targetUserId: payload.targetUserId ?? null,
        orderId: payload.orderId ?? null,
        deliveryId: payload.deliveryId ?? null,
        conversationId: payload.conversationId ?? null,
        messageId: payload.messageId ?? null,
        branchId: payload.branchId ?? null,
        metadataJson: payload.metadataJson,
        ipAddress: payload.ipAddress ?? null,
        userAgent: payload.userAgent ?? null,
      },
      include: auditLogInclude,
    });
  }

  listRecent(limit = 50): Promise<AuditLogRecord[]> {
    return this.prisma.auditLog.findMany({
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findByResource(
    resourceType: AuditResourceType,
    resourceId: string,
    limit = 50,
  ): Promise<AuditLogRecord[]> {
    return this.prisma.auditLog.findMany({
      where: {
        resourceType,
        resourceId,
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findByOrderId(orderId: string, limit = 50): Promise<AuditLogRecord[]> {
    return this.prisma.auditLog.findMany({
      where: {
        orderId,
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findBranchMenuScopeLogs(
    branchId: string,
    limit = 50,
  ): Promise<AuditLogRecord[]> {
    return this.prisma.auditLog.findMany({
      where: {
        branchId,
        resourceType: {
          in: [AuditResourceType.MENU_CATEGORY, AuditResourceType.MENU_ITEM],
        },
        action: {
          in: [...branchMenuScopeAuditActions],
        },
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findBranchInventoryAdjustmentLogs(
    branchId: string,
    limit = 50,
  ): Promise<AuditLogRecord[]> {
    return this.prisma.auditLog.findMany({
      where: {
        branchId,
        resourceType: {
          in: [AuditResourceType.MENU_ITEM, AuditResourceType.ITEM_OPTION],
        },
        action: {
          in: [...branchInventoryAdjustmentAuditActions],
        },
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  }

  findInventoryAlertAcknowledgementLogs(
    notificationIds: string[],
  ): Promise<AuditLogRecord[]> {
    if (notificationIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.auditLog.findMany({
      where: {
        resourceType: AuditResourceType.NOTIFICATION,
        resourceId: {
          in: notificationIds,
        },
        action: inventoryAlertAcknowledgementAction,
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findInventoryAlertLifecycleLogs(
    notificationIds: string[],
  ): Promise<AuditLogRecord[]> {
    if (notificationIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.auditLog.findMany({
      where: {
        resourceType: AuditResourceType.NOTIFICATION,
        resourceId: {
          in: notificationIds,
        },
        action: {
          in: [
            inventoryAlertAcknowledgementAction,
            inventoryAlertResolutionAction,
            inventoryAlertDismissalAction,
          ],
        },
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  findInventoryAlertFollowUpLogs(
    notificationIds: string[],
  ): Promise<AuditLogRecord[]> {
    if (notificationIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.auditLog.findMany({
      where: {
        resourceType: AuditResourceType.NOTIFICATION,
        resourceId: {
          in: notificationIds,
        },
        action: {
          in: [inventoryAlertReminderAction, inventoryAlertEscalationAction],
        },
      },
      include: auditLogInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }
}
