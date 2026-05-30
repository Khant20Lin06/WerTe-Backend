import {
  MessageAttachmentType,
  MessageAttachmentVisibility,
  MessageDeliveryStatus,
  MessageSenderKind,
  MessageType,
  Prisma,
  SystemMessageCode,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import {
  ConversationMessageRecord,
  conversationMessageSelect,
} from '../entities/conversation-message-list.entity';
import {
  buildSentMessage,
  SentMessageEntity,
  sentMessageInclude,
} from '../entities/sent-message.entity';

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

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMessageReadContextById(messageId: string): Promise<{
    id: string;
    conversationId: string;
  } | null> {
    return this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
      select: {
        id: true,
        conversationId: true,
      },
    });
  }

  async create(payload: CreateMessageInput): Promise<SentMessageEntity> {
    const message = await this.prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationId: payload.conversationId,
          senderKind: payload.senderKind,
          senderId: payload.senderId ?? null,
          type: payload.type,
          systemEventCode: payload.systemEventCode ?? null,
          body: payload.body,
          metadataJson: payload.metadataJson,
          attachments: {
            create: payload.attachments.map((attachment) => ({
              type: attachment.type,
              visibility: attachment.visibility,
              storageKey: attachment.storageKey,
              fileName: attachment.fileName,
              mimeType: attachment.mimeType,
              fileSizeBytes: attachment.fileSizeBytes,
              width: attachment.width,
              height: attachment.height,
            })),
          },
          receipts: {
            create: payload.receiptUserIds.map((userId) => ({
              userId,
              status:
                payload.senderId != null && userId === payload.senderId
                  ? MessageDeliveryStatus.READ
                  : MessageDeliveryStatus.DELIVERED,
              deliveredAt: new Date(),
              readAt:
                payload.senderId != null && userId === payload.senderId
                  ? new Date()
                  : null,
            })),
          },
        },
        include: sentMessageInclude,
      });

      await tx.conversation.update({
        where: {
          id: payload.conversationId,
        },
        data: {
          lastMessageId: createdMessage.id,
          lastMessageAt: createdMessage.createdAt,
        },
      });

      return createdMessage;
    });

    return buildSentMessage(message);
  }

  createSystemEvent(payload: {
    conversationId: string;
    systemEventCode: SystemMessageCode;
    body: string;
    metadataJson?: Prisma.InputJsonValue;
    receiptUserIds: string[];
  }): Promise<SentMessageEntity> {
    return this.create({
      conversationId: payload.conversationId,
      senderKind: 'SYSTEM',
      senderId: null,
      type: MessageType.SYSTEM_EVENT,
      systemEventCode: payload.systemEventCode,
      body: payload.body,
      metadataJson: payload.metadataJson,
      attachments: [],
      receiptUserIds: payload.receiptUserIds,
    });
  }

  async countUnreadByConversationIds(
    userId: string,
    conversationIds: string[],
  ): Promise<Record<string, number>> {
    if (conversationIds.length === 0) {
      return {};
    }

    const receipts = await this.prisma.messageReceipt.findMany({
      where: {
        userId,
        status: {
          not: MessageDeliveryStatus.READ,
        },
        message: {
          conversationId: {
            in: conversationIds,
          },
        },
      },
      select: {
        message: {
          select: {
            conversationId: true,
          },
        },
      },
    });

    return receipts.reduce<Record<string, number>>((counts, receipt) => {
      const conversationId = receipt.message.conversationId;
      counts[conversationId] = (counts[conversationId] ?? 0) + 1;
      return counts;
    }, {});
  }

  async listConversationMessages(
    conversationId: string,
    input?: {
      cursor?: string;
      limit?: number;
    },
  ): Promise<{
    records: ConversationMessageRecord[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const limit = Math.min(Math.max(input?.limit ?? 20, 1), 100);
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      select: conversationMessageSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      cursor:
        input?.cursor === undefined
          ? undefined
          : {
              id: input.cursor,
            },
      skip: input?.cursor === undefined ? 0 : 1,
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const slice = hasMore ? messages.slice(0, limit) : messages;
    const ordered = [...slice].reverse();

    return {
      records: ordered,
      nextCursor: hasMore ? ordered[0]?.id ?? null : null,
      hasMore,
    };
  }

  async markConversationReadUpTo(input: {
    conversationId: string;
    targetMessageId: string;
    userId: string;
  }): Promise<MarkedMessageReadEntity> {
    const readAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      const orderedMessages = await tx.message.findMany({
        where: {
          conversationId: input.conversationId,
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
        },
      });

      const targetIndex = orderedMessages.findIndex(
        (message) => message.id === input.targetMessageId,
      );

      if (targetIndex === -1) {
        return {
          conversationId: input.conversationId,
          messageId: input.targetMessageId,
          readAt: readAt.toISOString(),
        };
      }

      const messageIds = orderedMessages
        .slice(0, targetIndex + 1)
        .map((message) => message.id);

      await tx.messageReceipt.updateMany({
        where: {
          userId: input.userId,
          messageId: {
            in: messageIds,
          },
          status: {
            not: MessageDeliveryStatus.READ,
          },
        },
        data: {
          status: MessageDeliveryStatus.READ,
          readAt,
        },
      });

      await tx.conversationParticipant.updateMany({
        where: {
          conversationId: input.conversationId,
          userId: input.userId,
          leftAt: null,
        },
        data: {
          lastReadMessageId: input.targetMessageId,
          lastReadAt: readAt,
        },
      });

      return {
        conversationId: input.conversationId,
        messageId: input.targetMessageId,
        readAt: readAt.toISOString(),
      };
    });
  }
}
