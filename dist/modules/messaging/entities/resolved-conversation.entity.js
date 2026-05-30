"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvedConversationEntity = exports.ResolvedConversationParticipantEntity = exports.resolvedConversationInclude = void 0;
exports.buildResolvedConversation = buildResolvedConversation;
const client_1 = require("@prisma/client");
exports.resolvedConversationInclude = client_1.Prisma.validator()({
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
class ResolvedConversationParticipantEntity {
}
exports.ResolvedConversationParticipantEntity = ResolvedConversationParticipantEntity;
class ResolvedConversationEntity {
}
exports.ResolvedConversationEntity = ResolvedConversationEntity;
function buildResolvedConversation(record) {
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
//# sourceMappingURL=resolved-conversation.entity.js.map