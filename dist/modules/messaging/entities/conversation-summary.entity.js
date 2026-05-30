"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSummaryEntity = exports.ConversationSummaryParticipantEntity = exports.ConversationPreviewEntity = exports.conversationSummaryInclude = void 0;
exports.buildConversationSummary = buildConversationSummary;
const client_1 = require("@prisma/client");
exports.conversationSummaryInclude = client_1.Prisma.validator()({
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
class ConversationPreviewEntity {
}
exports.ConversationPreviewEntity = ConversationPreviewEntity;
class ConversationSummaryParticipantEntity {
}
exports.ConversationSummaryParticipantEntity = ConversationSummaryParticipantEntity;
class ConversationSummaryEntity {
}
exports.ConversationSummaryEntity = ConversationSummaryEntity;
function buildConversationSummary(record, currentUserId, unreadCount) {
    const currentParticipant = record.participants.find((participant) => participant.userId === currentUserId && participant.leftAt === null) ?? null;
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
        currentParticipant: currentParticipant === null
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
        preview: record.lastMessage === null
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
//# sourceMappingURL=conversation-summary.entity.js.map