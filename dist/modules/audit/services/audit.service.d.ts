import { AuditActionSource, AuditActorType, AuditResourceType, Prisma, UserRole } from '@prisma/client';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditRepository } from '../repositories/audit.repository';
export declare class AuditService {
    private readonly auditRepository;
    constructor(auditRepository: AuditRepository);
    logAction(payload: {
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
    }): Promise<AuditLogEntity>;
    listRecent(limit?: number): Promise<AuditLogEntity[]>;
    listByResource(resourceType: AuditResourceType, resourceId: string, limit?: number): Promise<AuditLogEntity[]>;
    listByOrderId(orderId: string, limit?: number): Promise<AuditLogEntity[]>;
}
