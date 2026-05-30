import { Injectable } from '@nestjs/common';
import { ConversationType } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  buildConversationOrderContext,
  ConversationOrderContextEntity,
  conversationOrderContextSelect,
} from '../entities/conversation-order-context.entity';
import {
  buildResolvedConversation,
  resolvedConversationInclude,
  ResolvedConversationEntity,
} from '../entities/resolved-conversation.entity';
import {
  conversationSummaryInclude,
  ConversationSummaryRecord,
} from '../entities/conversation-summary.entity';
import { ConversationParticipantSpec } from '../policies/conversation-resolution-policy.helper';

type ResolveConversationInput = {
  orderId: string;
  type: ConversationType;
  title: string;
  participants: ConversationParticipantSpec[];
};

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrderContextById(
    orderId: string,
  ): Promise<ConversationOrderContextEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: conversationOrderContextSelect,
    });

    return order === null ? null : buildConversationOrderContext(order);
  }

  async resolve(
    payload: ResolveConversationInput,
  ): Promise<ResolvedConversationEntity> {
    const conversation = await this.prisma.$transaction(async (tx) => {
      const conversationRecord = await tx.conversation.upsert({
        where: {
          orderId_type: {
            orderId: payload.orderId,
            type: payload.type,
          },
        },
        create: {
          orderId: payload.orderId,
          type: payload.type,
          title: payload.title,
        },
        update: {
          title: payload.title,
        },
      });

      for (const participant of payload.participants) {
        await tx.conversationParticipant.upsert({
          where: {
            conversationId_participantKey: {
              conversationId: conversationRecord.id,
              participantKey: participant.participantKey,
            },
          },
          create: {
            conversationId: conversationRecord.id,
            participantKey: participant.participantKey,
            userId: participant.userId ?? null,
            roleAtJoin: participant.roleAtJoin,
            canSendMessages: participant.canSendMessages,
            canSendAttachments: participant.canSendAttachments,
            canSendProofs: participant.canSendProofs,
            canModerate: participant.canModerate,
            leftAt: null,
          },
          update: {
            userId: participant.userId ?? null,
            roleAtJoin: participant.roleAtJoin,
            canSendMessages: participant.canSendMessages,
            canSendAttachments: participant.canSendAttachments,
            canSendProofs: participant.canSendProofs,
            canModerate: participant.canModerate,
            leftAt: null,
          },
        });
      }

      return tx.conversation.findUniqueOrThrow({
        where: {
          id: conversationRecord.id,
        },
        include: resolvedConversationInclude,
      });
    });

    return buildResolvedConversation(conversation);
  }

  async findResolvedById(
    conversationId: string,
  ): Promise<ResolvedConversationEntity | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: resolvedConversationInclude,
    });

    return conversation === null ? null : buildResolvedConversation(conversation);
  }

  listConversationSummaryRecordsForUser(
    userId: string,
    limit = 20,
    orderId?: string,
  ): Promise<ConversationSummaryRecord[]> {
    return this.prisma.conversation.findMany({
      where: {
        orderId,
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: conversationSummaryInclude,
      orderBy: [
        {
          lastMessageAt: 'desc',
        },
        {
          updatedAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: limit,
    });
  }

  findConversationSummaryRecordById(
    conversationId: string,
  ): Promise<ConversationSummaryRecord | null> {
    return this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: conversationSummaryInclude,
    });
  }
}
