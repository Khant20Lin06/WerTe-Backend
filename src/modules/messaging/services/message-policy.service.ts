import {
  MessageAttachmentType,
  MessageType,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import {
  canAccessConversation,
  canModerateConversation,
  canSendAttachment,
  canSendMessage,
  getActiveConversationParticipant,
} from '../policies/message-access-policy.helper';

@Injectable()
export class MessagingPolicyService {
  findActiveParticipant(
    currentUser: AuthenticatedUserEntity,
    conversation: ResolvedConversationEntity,
  ) {
    return getActiveConversationParticipant({
      currentUser,
      conversation,
    });
  }

  canAccessConversation(
    currentUser: AuthenticatedUserEntity,
    conversation: ResolvedConversationEntity,
  ): boolean {
    return canAccessConversation({
      currentUser,
      conversation,
    });
  }

  canSendMessage(
    currentUser: AuthenticatedUserEntity,
    conversation: ResolvedConversationEntity,
    messageType: MessageType = MessageType.TEXT,
  ): boolean {
    return canSendMessage({
      currentUser,
      conversation,
      messageType,
    });
  }

  canSendAttachment(
    currentUser: AuthenticatedUserEntity,
    conversation: ResolvedConversationEntity,
    attachmentType: MessageAttachmentType,
  ): boolean {
    return canSendAttachment({
      currentUser,
      conversation,
      attachmentType,
    });
  }

  canModerateConversation(
    currentUser: AuthenticatedUserEntity,
    conversation: ResolvedConversationEntity,
  ): boolean {
    return canModerateConversation({
      currentUser,
      conversation,
    });
  }
}
