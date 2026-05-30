import {
  ConversationParticipantRole,
  MessageType,
  Prisma,
  SystemMessageCode,
} from '@prisma/client';

export const conversationSummaryInclude =
  Prisma.validator<Prisma.ConversationInclude>()({
    order: {
      select: {
        orderCode: true,
        status: true,
      },
    },
    participants: {
      orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
      select: {
        participantKey: true,
        userId: true,
        roleAtJoin: true,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: true,
        canModerate: true,
        lastReadMessageId: true,
        lastReadAt: true,
        leftAt: true,
      },
    },
    lastMessage: {
      select: {
        id: true,
        senderKind: true,
        senderId: true,
        type: true,
        systemEventCode: true,
        body: true,
        createdAt: true,
        attachments: {
          select: {
            id: true,
          },
        },
      },
    },
  });

export type ConversationSummaryRecord = Prisma.ConversationGetPayload<{
  include: typeof conversationSummaryInclude;
}>;

export class ConversationPreviewEntity {
  messageId!: string;
  senderKind!: 'USER' | 'SYSTEM';
  senderId!: string | null;
  type!: MessageType;
  systemEventCode!: SystemMessageCode | null;
  body!: string;
  attachmentCount!: number;
  createdAt!: string;
}

export class ConversationSummaryParticipantEntity {
  participantKey!: string;
  userId!: string | null;
  roleAtJoin!: ConversationParticipantRole;
  leftAt!: string | null;
}

export class ConversationSummaryEntity {
  conversationId!: string;
  orderId!: string;
  orderCode!: string;
  orderStatus!: string;
  type!: string;
  title!: string | null;
  lastMessageId!: string | null;
  lastMessageAt!: string | null;
  unreadCount!: number;
  createdAt!: string;
  updatedAt!: string;
  currentParticipant!: {
    participantKey: string;
    roleAtJoin: ConversationParticipantRole;
    canSendMessages: boolean;
    canSendAttachments: boolean;
    canSendProofs: boolean;
    canModerate: boolean;
    lastReadMessageId: string | null;
    lastReadAt: string | null;
  } | null;
  participants!: ConversationSummaryParticipantEntity[];
  preview!: ConversationPreviewEntity | null;
}

export function buildConversationSummary(
  record: ConversationSummaryRecord,
  currentUserId: string,
  unreadCount: number,
): ConversationSummaryEntity {
  const currentParticipant =
    record.participants.find(
      (participant) =>
        participant.userId === currentUserId && participant.leftAt === null,
    ) ?? null;

  return {
    conversationId: record.id,
    orderId: record.orderId,
    orderCode: record.order.orderCode,
    orderStatus: record.order.status,
    type: record.type,
    title: record.title ?? null,
    lastMessageId: record.lastMessageId ?? null,
    lastMessageAt: record.lastMessageAt?.toISOString() ?? null,
    unreadCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    currentParticipant:
      currentParticipant === null
        ? null
        : {
            participantKey: currentParticipant.participantKey,
            roleAtJoin: currentParticipant.roleAtJoin,
            canSendMessages: currentParticipant.canSendMessages,
            canSendAttachments: currentParticipant.canSendAttachments,
            canSendProofs: currentParticipant.canSendProofs,
            canModerate: currentParticipant.canModerate,
            lastReadMessageId: currentParticipant.lastReadMessageId ?? null,
            lastReadAt: currentParticipant.lastReadAt?.toISOString() ?? null,
          },
    participants: record.participants.map((participant) => ({
      participantKey: participant.participantKey,
      userId: participant.userId ?? null,
      roleAtJoin: participant.roleAtJoin,
      leftAt: participant.leftAt?.toISOString() ?? null,
    })),
    preview:
      record.lastMessage === null
        ? null
        : {
            messageId: record.lastMessage.id,
            senderKind: record.lastMessage.senderKind,
            senderId: record.lastMessage.senderId ?? null,
            type: record.lastMessage.type,
            systemEventCode: record.lastMessage.systemEventCode ?? null,
            body: record.lastMessage.body,
            attachmentCount: record.lastMessage.attachments.length,
            createdAt: record.lastMessage.createdAt.toISOString(),
          },
  };
}
