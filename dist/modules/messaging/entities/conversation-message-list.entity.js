"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMessageListEntity = exports.ConversationMessageEntity = exports.ConversationMessageReceiptEntity = exports.ConversationMessageAttachmentEntity = exports.conversationMessageSelect = void 0;
exports.buildConversationMessage = buildConversationMessage;
exports.buildConversationMessageList = buildConversationMessageList;
const client_1 = require("@prisma/client");
const message_attachment_visibility_helper_1 = require("../policies/message-attachment-visibility.helper");
exports.conversationMessageSelect = client_1.Prisma.validator()({
    id: true,
    conversationId: true,
    senderKind: true,
    senderId: true,
    type: true,
    systemEventCode: true,
    body: true,
    metadataJson: true,
    deletedAt: true,
    createdAt: true,
    sender: {
        select: {
            id: true,
            role: true,
            customerProfile: {
                select: {
                    fullName: true,
                },
            },
            riderProfile: {
                select: {
                    displayName: true,
                },
            },
            merchantProfile: {
                select: {
                    name: true,
                },
            },
        },
    },
    attachments: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
            type: true,
            visibility: true,
            storageKey: true,
            fileName: true,
            mimeType: true,
            fileSizeBytes: true,
            width: true,
            height: true,
            createdAt: true,
        },
    },
    receipts: {
        orderBy: [{ id: 'asc' }],
        select: {
            userId: true,
            status: true,
            deliveredAt: true,
            readAt: true,
        },
    },
});
class ConversationMessageAttachmentEntity {
}
exports.ConversationMessageAttachmentEntity = ConversationMessageAttachmentEntity;
class ConversationMessageReceiptEntity {
}
exports.ConversationMessageReceiptEntity = ConversationMessageReceiptEntity;
class ConversationMessageEntity {
}
exports.ConversationMessageEntity = ConversationMessageEntity;
class ConversationMessageListEntity {
}
exports.ConversationMessageListEntity = ConversationMessageListEntity;
function buildConversationMessage(record, input) {
    return {
        messageId: record.id,
        conversationId: record.conversationId,
        senderKind: record.senderKind,
        senderId: record.senderId ?? null,
        senderRole: record.senderKind === 'SYSTEM'
            ? 'SYSTEM'
            : record.sender?.role ?? null,
        senderDisplayName: record.senderKind === 'SYSTEM'
            ? 'System'
            : resolveSenderDisplayName(record),
        type: record.type,
        systemEventCode: record.systemEventCode ?? null,
        body: record.body,
        metadataJson: record.metadataJson ?? null,
        deletedAt: record.deletedAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
        isOwnMessage: record.senderKind === 'USER' && record.senderId === input.currentUserId,
        attachments: record.attachments
            .filter((attachment) => (0, message_attachment_visibility_helper_1.canParticipantViewAttachment)(input.viewerRole, attachment.visibility))
            .map((attachment) => ({
            type: attachment.type,
            visibility: attachment.visibility,
            storageKey: attachment.storageKey,
            fileName: attachment.fileName ?? null,
            mimeType: attachment.mimeType ?? null,
            fileSizeBytes: attachment.fileSizeBytes ?? null,
            width: attachment.width ?? null,
            height: attachment.height ?? null,
            createdAt: attachment.createdAt.toISOString(),
        })),
        receipts: record.receipts.map((receipt) => ({
            userId: receipt.userId,
            status: receipt.status,
            deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
            readAt: receipt.readAt?.toISOString() ?? null,
        })),
    };
}
function buildConversationMessageList(conversationId, messages, nextCursor, hasMore) {
    return {
        conversationId,
        nextCursor,
        hasMore,
        messages,
    };
}
function resolveSenderDisplayName(record) {
    switch (record.sender?.role) {
        case 'CUSTOMER':
            return record.sender.customerProfile?.fullName ?? 'Customer';
        case 'MERCHANT':
            return record.sender.merchantProfile?.name ?? 'Merchant';
        case 'RIDER':
            return record.sender.riderProfile?.displayName ?? 'Rider';
        case 'ADMIN':
            return 'Admin';
        case 'SUPPORT':
            return 'Support';
        default:
            return null;
    }
}
//# sourceMappingURL=conversation-message-list.entity.js.map