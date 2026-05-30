import { MessageAttachmentType, MessageAttachmentVisibility, MessageDeliveryStatus, MessageSenderKind, MessageType, Prisma, SystemMessageCode } from '@prisma/client';
export declare const sentMessageInclude: {
    receipts: {
        orderBy: [{
            id: "asc";
        }];
        select: {
            userId: true;
            status: true;
            deliveredAt: true;
            readAt: true;
        };
    };
    attachments: {
        orderBy: [{
            createdAt: "asc";
        }, {
            id: "asc";
        }];
        select: {
            type: true;
            visibility: true;
            storageKey: true;
            fileName: true;
            mimeType: true;
            fileSizeBytes: true;
            width: true;
            height: true;
            createdAt: true;
        };
    };
};
export type SentMessageRecord = Prisma.MessageGetPayload<{
    include: typeof sentMessageInclude;
}>;
export declare class SentMessageReceiptEntity {
    userId: string;
    status: MessageDeliveryStatus;
    deliveredAt: string | null;
    readAt: string | null;
}
export declare class SentMessageAttachmentEntity {
    type: MessageAttachmentType;
    visibility: MessageAttachmentVisibility;
    storageKey: string;
    fileName: string | null;
    mimeType: string | null;
    fileSizeBytes: number | null;
    width: number | null;
    height: number | null;
    createdAt: string;
}
export declare class SentMessageEntity {
    messageId: string;
    conversationId: string;
    senderKind: MessageSenderKind;
    senderId: string | null;
    type: MessageType;
    systemEventCode: SystemMessageCode | null;
    body: string;
    metadataJson: Prisma.JsonValue | null;
    deletedAt: string | null;
    createdAt: string;
    receipts: SentMessageReceiptEntity[];
    attachments: SentMessageAttachmentEntity[];
}
export declare function buildSentMessage(record: SentMessageRecord): SentMessageEntity;
