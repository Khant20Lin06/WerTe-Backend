import { AuditActionSource, AuditActorType, AuditResourceType, Prisma, UserRole } from '@prisma/client';
export declare const auditLogInclude: {
    actorUser: {
        select: {
            id: true;
            role: true;
            phone: true;
        };
    };
    targetUser: {
        select: {
            id: true;
            role: true;
            phone: true;
        };
    };
    order: {
        select: {
            id: true;
            orderCode: true;
            status: true;
        };
    };
    delivery: {
        select: {
            id: true;
            status: true;
        };
    };
    conversation: {
        select: {
            id: true;
            type: true;
        };
    };
    message: {
        select: {
            id: true;
            type: true;
        };
    };
    branch: {
        select: {
            id: true;
            name: true;
        };
    };
};
export type AuditLogRecord = Prisma.AuditLogGetPayload<{
    include: typeof auditLogInclude;
}>;
export declare class AuditUserSummaryEntity {
    userId: string;
    role: UserRole;
    phone: string;
}
export declare class AuditLogEntity {
    auditLogId: string;
    actorType: AuditActorType;
    actorRole: UserRole | null;
    actionSource: AuditActionSource;
    action: string;
    resourceType: AuditResourceType;
    resourceId: string;
    resourceLabel: string | null;
    metadata: Prisma.JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
    orderId: string | null;
    orderCode: string | null;
    deliveryId: string | null;
    deliveryStatus: string | null;
    conversationId: string | null;
    conversationType: string | null;
    messageId: string | null;
    messageType: string | null;
    branchId: string | null;
    branchName: string | null;
    actorUser: AuditUserSummaryEntity | null;
    targetUser: AuditUserSummaryEntity | null;
    createdAt: string;
}
export declare function buildAuditLogEntity(record: AuditLogRecord): AuditLogEntity;
