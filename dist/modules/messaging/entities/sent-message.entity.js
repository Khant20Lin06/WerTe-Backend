"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentMessageEntity = exports.SentMessageAttachmentEntity = exports.SentMessageReceiptEntity = exports.sentMessageInclude = void 0;
exports.buildSentMessage = buildSentMessage;
const client_1 = require("@prisma/client");
exports.sentMessageInclude = client_1.Prisma.validator()({
    receipts: {
        orderBy: [{ id: 'asc' }],
        select: {
            userId: true,
            status: true,
            deliveredAt: true,
            readAt: true,
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
});
class SentMessageReceiptEntity {
}
exports.SentMessageReceiptEntity = SentMessageReceiptEntity;
class SentMessageAttachmentEntity {
}
exports.SentMessageAttachmentEntity = SentMessageAttachmentEntity;
class SentMessageEntity {
}
exports.SentMessageEntity = SentMessageEntity;
function buildSentMessage(record) {
    return {
        messageId: record.id,
        conversationId: record.conversationId,
        senderKind: record.senderKind,
        senderId: record.senderId ?? null,
        type: record.type,
        systemEventCode: record.systemEventCode ?? null,
        body: record.body,
        metadataJson: record.metadataJson ?? null,
        deletedAt: record.deletedAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
        receipts: record.receipts.map((receipt) => ({
            userId: receipt.userId,
            status: receipt.status,
            deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
            readAt: receipt.readAt?.toISOString() ?? null,
        })),
        attachments: record.attachments.map((attachment) => ({
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
    };
}
//# sourceMappingURL=sent-message.entity.js.map