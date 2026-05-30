import { Injectable } from '@nestjs/common';
import { ConversationType } from '@prisma/client';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../entities/conversation-order-context.entity';
import {
  buildConversationParticipants,
  buildConversationTitle,
  canResolveConversationForOrder,
  ConversationParticipantSpec,
} from './conversation-resolution-policy.helper';

@Injectable()
export class MessagePolicyService {
  canResolveConversation(
    currentUser: AuthenticatedUserEntity,
    order: ConversationOrderContextEntity,
    type: ConversationType,
  ): boolean {
    return canResolveConversationForOrder({
      currentUser,
      order,
      type,
    });
  }

  buildConversationParticipants(
    currentUser: AuthenticatedUserEntity,
    order: ConversationOrderContextEntity,
    type: ConversationType,
  ): ConversationParticipantSpec[] | null {
    return buildConversationParticipants({
      currentUser,
      order,
      type,
    });
  }

  buildConversationTitle(
    order: ConversationOrderContextEntity,
    type: ConversationType,
  ): string {
    return buildConversationTitle(order, type);
  }
}
