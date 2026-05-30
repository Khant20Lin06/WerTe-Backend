import { ConversationParticipantRole, MessageAttachmentType, MessageAttachmentVisibility, MessageDeliveryStatus, MessageSenderKind, MessageType, Prisma, SystemMessageCode, UserRole } from '@prisma/client';
export declare const conversationMessageSelect: {
    id: true;
    conversationId: true;
    senderKind: true;
    senderId: true;
    type: true;
    systemEventCode: true;
    body: true;
    metadataJson: true;
    deletedAt: true;
    createdAt: true;
    sender: {
        select: {
            id: true;
            role: true;
            customerProfile: {
                select: {
                    fullName: true;
                };
            };
            riderProfile: {
                select: {
                    displayName: true;
                };
            };
            merchantProfile: {
                select: {
                    name: true;
                };
            };
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
};
export type ConversationMessageRecord = Prisma.MessageGetPayload<{
    select: typeof conversationMessageSelect;
}>;
export declare class ConversationMessageAttachmentEntity {
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
export declare class ConversationMessageReceiptEntity {
    userId: string;
    status: MessageDeliveryStatus;
    deliveredAt: string | null;
    readAt: string | null;
}
export declare class ConversationMessageEntity {
    messageId: string;
    conversationId: string;
    senderKind: MessageSenderKind;
    senderId: string | null;
    senderRole: UserRole | 'SYSTEM' | null;
    senderDisplayName: string | null;
    type: MessageType;
    systemEventCode: SystemMessageCode | null;
    body: string;
    metadataJson: Prisma.JsonValue | null;
    deletedAt: string | null;
    createdAt: string;
    isOwnMessage: boolean;
    attachments: ConversationMessageAttachmentEntity[];
    receipts: ConversationMessageReceiptEntity[];
}
export declare class ConversationMessageListEntity {
    conversationId: string;
    nextCursor: string | null;
    hasMore: boolean;
    messages: ConversationMessageEntity[];
}
export declare function buildConversationMessage(record: ConversationMessageRecord, input: {
    currentUserId: string;
    viewerRole: ConversationParticipantRole;
}): ConversationMessageEntity;
export declare function buildConversationMessageList(conversationId: string, messages: ConversationMessageEntity[], nextCursor: string | null, hasMore: boolean): ConversationMessageListEntity;
