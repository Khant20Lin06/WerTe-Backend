import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCodes } from '../../../common/constants/error-codes';
import { AppException } from '../../../common/exceptions/app.exception';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { MessageDeliveryService } from './message-delivery.service';
import { MessagingPolicyService } from './message-policy.service';

@Injectable()
export class MessageReceiptService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly messagingPolicyService: MessagingPolicyService,
    private readonly messageDeliveryService: MessageDeliveryService,
  ) {}

  async markMessageRead(
    currentUser: AuthenticatedUserEntity,
    messageId: string,
  ): Promise<MarkedMessageReadEntity> {
    const context = await this.messageRepository.findMessageReadContextById(
      messageId,
    );

    if (context === null) {
      throw new AppException('Message was not found.', HttpStatus.NOT_FOUND, {
        code: ErrorCodes.notFound,
      });
    }

    const conversation = await this.conversationRepository.findResolvedById(
      context.conversationId,
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

    if (
      this.messagingPolicyService.findActiveParticipant(
        currentUser,
        conversation,
      ) === null
    ) {
      throw new AppException(
        'The authenticated actor is not an active participant in the conversation.',
        HttpStatus.FORBIDDEN,
        {
          code: ErrorCodes.forbidden,
        },
      );
    }

    const receipt = await this.messageRepository.markConversationReadUpTo({
      conversationId: context.conversationId,
      targetMessageId: context.id,
      userId: currentUser.userId,
    });

    this.messageDeliveryService.emitMessageRead(receipt);
    this.messageDeliveryService.emitConversationUpdated(
      context.conversationId,
    );

    return receipt;
  }
}
