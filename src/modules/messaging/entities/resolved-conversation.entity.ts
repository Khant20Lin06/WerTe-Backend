import {
  ConversationParticipantRole,
  ConversationType,
  Prisma,
} from '@prisma/client';

export const resolvedConversationInclude =
  Prisma.validator<Prisma.ConversationInclude>()({
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
      joinedAt: true,
      leftAt: true,
    },
    },
  });

export type ResolvedConversationRecord = Prisma.ConversationGetPayload<{
  include: typeof resolvedConversationInclude;
}>;

export class ResolvedConversationParticipantEntity {
  participantKey!: string;
  userId!: string | null;
  roleAtJoin!: ConversationParticipantRole;
  canSendMessages!: boolean;
  canSendAttachments!: boolean;
  canSendProofs!: boolean;
  canModerate!: boolean;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
  joinedAt!: string;
  leftAt!: string | null;
}

export class ResolvedConversationEntity {
  conversationId!: string;
  orderId!: string;
  type!: ConversationType;
  title!: string | null;
  lastMessageId!: string | null;
  lastMessageAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
  participants!: ResolvedConversationParticipantEntity[];
}

export function buildResolvedConversation(
  record: ResolvedConversationRecord,
): ResolvedConversationEntity {
  return {
    conversationId: record.id,
    orderId: record.orderId,
    type: record.type,
    title: record.title ?? null,
    lastMessageId: record.lastMessageId ?? null,
    lastMessageAt: record.lastMessageAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    participants: record.participants.map((participant) => ({
      participantKey: participant.participantKey,
      userId: participant.userId ?? null,
      roleAtJoin: participant.roleAtJoin,
      canSendMessages: participant.canSendMessages,
      canSendAttachments: participant.canSendAttachments,
      canSendProofs: participant.canSendProofs,
      canModerate: participant.canModerate,
      lastReadMessageId: participant.lastReadMessageId ?? null,
      lastReadAt: participant.lastReadAt?.toISOString() ?? null,
      joinedAt: participant.joinedAt.toISOString(),
      leftAt: participant.leftAt?.toISOString() ?? null,
    })),
  };
}
