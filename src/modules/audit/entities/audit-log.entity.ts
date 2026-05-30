import { AuditActionSource, AuditActorType, AuditResourceType, Prisma, UserRole } from '@prisma/client';

export const auditLogInclude = Prisma.validator<Prisma.AuditLogInclude>()({
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

export type AuditLogRecord = Prisma.AuditLogGetPayload<{
  include: typeof auditLogInclude;
}>;

export class AuditUserSummaryEntity {
  userId!: string;
  role!: UserRole;
  phone!: string;
}

export class AuditLogEntity {
  auditLogId!: string;
  actorType!: AuditActorType;
  actorRole!: UserRole | null;
  actionSource!: AuditActionSource;
  action!: string;
  resourceType!: AuditResourceType;
  resourceId!: string;
  resourceLabel!: string | null;
  metadata!: Prisma.JsonValue | null;
  ipAddress!: string | null;
  userAgent!: string | null;
  orderId!: string | null;
  orderCode!: string | null;
  deliveryId!: string | null;
  deliveryStatus!: string | null;
  conversationId!: string | null;
  conversationType!: string | null;
  messageId!: string | null;
  messageType!: string | null;
  branchId!: string | null;
  branchName!: string | null;
  actorUser!: AuditUserSummaryEntity | null;
  targetUser!: AuditUserSummaryEntity | null;
  createdAt!: string;
}

export function buildAuditLogEntity(record: AuditLogRecord): AuditLogEntity {
  return {
    auditLogId: record.id,
    actorType: record.actorType,
    actorRole: record.actorRole ?? null,
    actionSource: record.actionSource,
    action: record.action,
    resourceType: record.resourceType,
    resourceId: record.resourceId,
    resourceLabel: record.resourceLabel ?? null,
    metadata: (record.metadataJson as Prisma.JsonValue | null) ?? null,
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
    actorUser:
      record.actorUser === null
        ? null
        : {
            userId: record.actorUser.id,
            role: record.actorUser.role,
            phone: record.actorUser.phone,
          },
    targetUser:
      record.targetUser === null
        ? null
        : {
            userId: record.targetUser.id,
            role: record.targetUser.role,
            phone: record.targetUser.phone,
          },
    createdAt: record.createdAt.toISOString(),
  };
}
