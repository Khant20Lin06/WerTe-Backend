import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  buildConversationSummary,
  ConversationSummaryEntity,
} from '../entities/conversation-summary.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessagingPolicyService } from './message-policy.service';

@Injectable()
export class ConversationReadService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly messagingPolicyService: MessagingPolicyService,
  ) {}

  async listCurrentUserConversations(
    currentUser: AuthenticatedUserEntity,
    limit = 20,
    orderId?: string,
  ): Promise<ConversationSummaryEntity[]> {
    const records =
      await this.conversationRepository.listConversationSummaryRecordsForUser(
        currentUser.userId,
        limit,
        orderId,
      );
    const unreadCounts = await this.messageRepository.countUnreadByConversationIds(
      currentUser.userId,
      records.map((record) => record.id),
    );

    return records.map((record) =>
      buildConversationSummary(
        record,
        currentUser.userId,
        unreadCounts[record.id] ?? 0,
      ),
    );
  }

  async listCurrentUserOrderConversations(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    limit = 20,
  ): Promise<ConversationSummaryEntity[]> {
    return this.listCurrentUserConversations(currentUser, limit, orderId);
  }

  async getCurrentUserConversation(
    currentUser: AuthenticatedUserEntity,
    conversationId: string,
  ): Promise<ConversationSummaryEntity> {
    const record =
      await this.conversationRepository.findConversationSummaryRecordById(
        conversationId,
      );

    if (record === null) {
      throw new AppException('Conversation was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const conversation = await this.conversationRepository.findResolvedById(
      conversationId,
    );

    if (
      conversation === null ||
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

    const unreadCounts = await this.messageRepository.countUnreadByConversationIds(
      currentUser.userId,
      [conversationId],
    );

    return buildConversationSummary(
      record,
      currentUser.userId,
      unreadCounts[conversationId] ?? 0,
    );
  }
}
