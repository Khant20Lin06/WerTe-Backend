import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  buildConversationMessage,
  buildConversationMessageList,
  ConversationMessageListEntity,
} from '../entities/conversation-message-list.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessagingPolicyService } from './message-policy.service';

@Injectable()
export class MessageReadService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly messagingPolicyService: MessagingPolicyService,
  ) {}

  async listCurrentUserConversationMessages(
    currentUser: AuthenticatedUserEntity,
    input: {
      conversationId: string;
      cursor?: string;
      limit?: number;
    },
  ): Promise<ConversationMessageListEntity> {
    const conversation = await this.conversationRepository.findResolvedById(
      input.conversationId,
    );

    if (conversation === null) {
      throw new AppException('Conversation was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    if (
      !this.messagingPolicyService.canAccessConversation(
        currentUser,
        conversation,
      )
    ) {
      throw new AppException(
        'You are not allowed to access this conversation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const participant = this.messagingPolicyService.findActiveParticipant(
      currentUser,
      conversation,
    );

    if (participant === null) {
      throw new AppException(
        'The authenticated actor is not an active participant in the conversation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const page = await this.messageRepository.listConversationMessages(
      input.conversationId,
      {
        cursor: input.cursor,
        limit: input.limit,
      },
    );

    return buildConversationMessageList(
      input.conversationId,
      page.records.map((record) =>
        buildConversationMessage(record, {
          currentUserId: currentUser.userId,
          viewerRole: participant.roleAtJoin,
        }),
      ),
      page.nextCursor,
      page.hasMore,
    );
  }
}
