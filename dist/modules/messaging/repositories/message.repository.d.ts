import { MessageAttachmentType, MessageAttachmentVisibility, MessageSenderKind, MessageType, Prisma, SystemMessageCode } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { ConversationMessageRecord } from '../entities/conversation-message-list.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';
type CreateMessageInput = {
    conversationId: string;
    senderKind: MessageSenderKind;
    senderId?: string | null;
    type: MessageType;
    systemEventCode?: SystemMessageCode | null;
    body: string;
    metadataJson?: Prisma.InputJsonValue;
    attachments: Array<{
        type: MessageAttachmentType;
        visibility: MessageAttachmentVisibility;
        storageKey: string;
        fileName?: string;
        mimeType?: string;
        fileSizeBytes?: number;
        width?: number;
        height?: number;
    }>;
    receiptUserIds: string[];
};
export declare class MessageRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMessageReadContextById(messageId: string): Promise<{
        id: string;
        conversationId: string;
    } | null>;
    create(payload: CreateMessageInput): Promise<SentMessageEntity>;
    createSystemEvent(payload: {
        conversationId: string;
        systemEventCode: SystemMessageCode;
        body: string;
        metadataJson?: Prisma.InputJsonValue;
        receiptUserIds: string[];
    }): Promise<SentMessageEntity>;
    countUnreadByConversationIds(userId: string, conversationIds: string[]): Promise<Record<string, number>>;
    listConversationMessages(conversationId: string, input?: {
        cursor?: string;
        limit?: number;
    }): Promise<{
        records: ConversationMessageRecord[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    markConversationReadUpTo(input: {
        conversationId: string;
        targetMessageId: string;
        userId: string;
    }): Promise<MarkedMessageReadEntity>;
}
export {};
