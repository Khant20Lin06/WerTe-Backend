import { AuditActionSource, AuditActorType, AuditResourceType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditLogRecord } from '../entities/audit-log.entity';
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
export declare class AuditRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(payload: CreateAuditLogInput): Promise<AuditLogRecord>;
    listRecent(limit?: number): Promise<AuditLogRecord[]>;
    findByResource(resourceType: AuditResourceType, resourceId: string, limit?: number): Promise<AuditLogRecord[]>;
    findByOrderId(orderId: string, limit?: number): Promise<AuditLogRecord[]>;
    findBranchMenuScopeLogs(branchId: string, limit?: number): Promise<AuditLogRecord[]>;
    findBranchInventoryAdjustmentLogs(branchId: string, limit?: number): Promise<AuditLogRecord[]>;
    findInventoryAlertAcknowledgementLogs(notificationIds: string[]): Promise<AuditLogRecord[]>;
    findInventoryAlertLifecycleLogs(notificationIds: string[]): Promise<AuditLogRecord[]>;
    findInventoryAlertFollowUpLogs(notificationIds: string[]): Promise<AuditLogRecord[]>;
}
export {};
