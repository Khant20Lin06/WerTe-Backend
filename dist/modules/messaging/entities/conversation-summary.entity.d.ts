import { ConversationParticipantRole, MessageType, Prisma, SystemMessageCode } from '@prisma/client';
export declare const conversationSummaryInclude: {
    order: {
        select: {
            orderCode: true;
            status: true;
        };
    };
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
            leftAt: true;
        };
    };
    lastMessage: {
        select: {
            id: true;
            senderKind: true;
            senderId: true;
            type: true;
            systemEventCode: true;
            body: true;
            createdAt: true;
            attachments: {
                select: {
                    id: true;
                };
            };
        };
    };
};
export type ConversationSummaryRecord = Prisma.ConversationGetPayload<{
    include: typeof conversationSummaryInclude;
}>;
export declare class ConversationPreviewEntity {
    messageId: string;
    senderKind: 'USER' | 'SYSTEM';
    senderId: string | null;
    type: MessageType;
    systemEventCode: SystemMessageCode | null;
    body: string;
    attachmentCount: number;
    createdAt: string;
}
export declare class ConversationSummaryParticipantEntity {
    participantKey: string;
    userId: string | null;
    roleAtJoin: ConversationParticipantRole;
    leftAt: string | null;
}
export declare class ConversationSummaryEntity {
    conversationId: string;
    orderId: string;
    orderCode: string;
    orderStatus: string;
    type: string;
    title: string | null;
    lastMessageId: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
    currentParticipant: {
        participantKey: string;
        roleAtJoin: ConversationParticipantRole;
        canSendMessages: boolean;
        canSendAttachments: boolean;
        canSendProofs: boolean;
        canModerate: boolean;
        lastReadMessageId: string | null;
        lastReadAt: string | null;
    } | null;
    participants: ConversationSummaryParticipantEntity[];
    preview: ConversationPreviewEntity | null;
}
export declare function buildConversationSummary(record: ConversationSummaryRecord, currentUserId: string, unreadCount: number): ConversationSummaryEntity;
