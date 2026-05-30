import { ConversationParticipantRole, ConversationType, Prisma } from '@prisma/client';
export declare const resolvedConversationInclude: {
    participants: {
        orderBy: [{
            joinedAt: "asc";
        }, {
            id: "asc";
        }];
        select: {
            participantKey: true;
            userId: true;
            roleAtJoin: true;
            canSendMessages: true;
            canSendAttachments: true;
            canSendProofs: true;
            canModerate: true;
            lastReadMessageId: true;
            lastReadAt: true;
            joinedAt: true;
            leftAt: true;
        };
    };
};
export type ResolvedConversationRecord = Prisma.ConversationGetPayload<{
    include: typeof resolvedConversationInclude;
}>;
export declare class ResolvedConversationParticipantEntity {
    participantKey: string;
    userId: string | null;
    roleAtJoin: ConversationParticipantRole;
    canSendMessages: boolean;
    canSendAttachments: boolean;
    canSendProofs: boolean;
    canModerate: boolean;
    lastReadMessageId?: string | null;
    lastReadAt?: string | null;
    joinedAt: string;
    leftAt: string | null;
}
export declare class ResolvedConversationEntity {
    conversationId: string;
    orderId: string;
    type: ConversationType;
    title: string | null;
    lastMessageId: string | null;
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
    participants: ResolvedConversationParticipantEntity[];
}
export declare function buildResolvedConversation(record: ResolvedConversationRecord): ResolvedConversationEntity;
