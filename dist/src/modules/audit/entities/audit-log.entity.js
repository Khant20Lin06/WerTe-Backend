"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogEntity = exports.AuditUserSummaryEntity = exports.auditLogInclude = void 0;
exports.buildAuditLogEntity = buildAuditLogEntity;
const client_1 = require("@prisma/client");
exports.auditLogInclude = client_1.Prisma.validator()({
    actorUser: {
        select: {
            id: true,
            role: true,
            phone: true,
        },
    },
    targetUser: {
        select: {
            id: true,
            role: true,
            phone: true,
        },
    },
    order: {
        select: {
            id: true,
            orderCode: true,
            status: true,
        },
    },
    delivery: {
        select: {
            id: true,
            status: true,
        },
    },
    conversation: {
        select: {
            id: true,
            type: true,
        },
    },
    message: {
        select: {
            id: true,
            type: true,
        },
    },
    branch: {
        select: {
            id: true,
            name: true,
        },
    },
});
class AuditUserSummaryEntity {
}
exports.AuditUserSummaryEntity = AuditUserSummaryEntity;
class AuditLogEntity {
}
exports.AuditLogEntity = AuditLogEntity;
function buildAuditLogEntity(record) {
    return {
        auditLogId: record.id,
        actorType: record.actorType,
        actorRole: record.actorRole ?? null,
        actionSource: record.actionSource,
        action: record.action,
        resourceType: record.resourceType,
        resourceId: record.resourceId,
        resourceLabel: record.resourceLabel ?? null,
        metadata: record.metadataJson ?? null,
        ipAddress: record.ipAddress ?? null,
        userAgent: record.userAgent ?? null,
        orderId: record.orderId ?? null,
        orderCode: record.order?.orderCode ?? null,
        deliveryId: record.deliveryId ?? null,
        deliveryStatus: record.delivery?.status ?? null,
        conversationId: record.conversationId ?? null,
        conversationType: record.conversation?.type ?? null,
        messageId: record.messageId ?? null,
        messageType: record.message?.type ?? null,
        branchId: record.branchId ?? null,
        branchName: record.branch?.name ?? null,
        actorUser: record.actorUser === null
            ? null
            : {
                userId: record.actorUser.id,
                role: record.actorUser.role,
                phone: record.actorUser.phone,
            },
        targetUser: record.targetUser === null
            ? null
            : {
                userId: record.targetUser.id,
                role: record.targetUser.role,
                phone: record.targetUser.phone,
            },
        createdAt: record.createdAt.toISOString(),
    };
}
//# sourceMappingURL=audit-log.entity.js.map