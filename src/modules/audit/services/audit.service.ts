import {
  AuditActionSource,
  AuditActorType,
  AuditResourceType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { AuditLogEntity, buildAuditLogEntity } from '../entities/audit-log.entity';
import { AuditRepository } from '../repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logAction(payload: {
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
  }): Promise<AuditLogEntity> {
    const auditLog = await this.auditRepository.create(payload);

    return buildAuditLogEntity(auditLog);
  }

  async listRecent(limit = 50): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.listRecent(limit);

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listByResource(
    resourceType: AuditResourceType,
    resourceId: string,
    limit = 50,
  ): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findByResource(
      resourceType,
      resourceId,
      limit,
    );

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listByOrderId(orderId: string, limit = 50): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findByOrderId(orderId, limit);

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listBranchMenuScopeLogs(
    branchId: string,
    limit = 50,
  ): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findBranchMenuScopeLogs(
      branchId,
      limit,
    );

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listBranchInventoryAdjustmentLogs(
    branchId: string,
    limit = 50,
  ): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findBranchInventoryAdjustmentLogs(
      branchId,
      limit,
    );

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listInventoryAlertAcknowledgementLogs(
    notificationIds: string[],
  ): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findInventoryAlertAcknowledgementLogs(
      notificationIds,
    );

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listInventoryAlertLifecycleLogs(
    notificationIds: string[],
  ): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findInventoryAlertLifecycleLogs(
      notificationIds,
    );

    return logs.map((log) => buildAuditLogEntity(log));
  }

  async listInventoryAlertFollowUpLogs(
    notificationIds: string[],
  ): Promise<AuditLogEntity[]> {
    const logs = await this.auditRepository.findInventoryAlertFollowUpLogs(
      notificationIds,
    );

    return logs.map((log) => buildAuditLogEntity(log));
  }
}
