import { Injectable } from '@nestjs/common';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { MarkReadDto } from '../dto/mark-read.dto';
import { ListConversationMessagesQueryDto } from '../dto/list-conversation-messages-query.dto';
import { ListConversationsQueryDto } from '../dto/list-conversations-query.dto';
import { ResolveConversationDto } from '../dto/resolve-conversation.dto';
import { SendConversationMessageDto } from '../dto/send-conversation-message.dto';
import { ConversationReadService } from './conversation-read.service';
import { ConversationService } from './conversation.service';
import { MessageReadService } from './message-read.service';
import { MessageReceiptService } from './message-receipt.service';
import { MessageService } from './message.service';

@Injectable()
export class MessagingRestService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly conversationReadService: ConversationReadService,
    private readonly messageReadService: MessageReadService,
    private readonly messageService: MessageService,
    private readonly messageReceiptService: MessageReceiptService,
  ) {}

  listCurrentUserConversations(
    currentUser: AuthenticatedUserEntity,
    query: ListConversationsQueryDto,
  ) {
    return this.conversationReadService.listCurrentUserConversations(
      currentUser,
      query.limit,
    );
  }

  listCurrentUserOrderConversations(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    query: ListConversationsQueryDto,
  ) {
    return this.conversationReadService.listCurrentUserOrderConversations(
      currentUser,
      orderId,
      query.limit,
    );
  }

  resolveCurrentUserConversationForOrder(
    currentUser: AuthenticatedUserEntity,
    orderId: string,
    body: ResolveConversationDto,
  ) {
    return this.conversationService.resolve(currentUser, {
      orderId,
      type: body.type,
    });
  }

  getCurrentUserConversation(
    currentUser: AuthenticatedUserEntity,
    conversationId: string,
  ) {
    return this.conversationReadService.getCurrentUserConversation(
      currentUser,
      conversationId,
    );
  }

  listCurrentUserConversationMessages(
    currentUser: AuthenticatedUserEntity,
    conversationId: string,
    query: ListConversationMessagesQueryDto,
  ) {
    return this.messageReadService.listCurrentUserConversationMessages(
      currentUser,
      {
        conversationId,
        cursor: query.cursor,
        limit: query.limit,
      },
    );
  }

  sendCurrentUserMessage(
    currentUser: AuthenticatedUserEntity,
    conversationId: string,
    body: SendConversationMessageDto,
  ) {
    return this.messageService.send(currentUser, {
      conversationId,
      type: body.type,
      body: body.body,
      attachments: body.attachments,
    });
  }

  async markCurrentUserMessageRead(
    currentUser: AuthenticatedUserEntity,
    messageId: string,
  ): Promise<MarkReadDto> {
    return this.messageReceiptService.markMessageRead(currentUser, messageId);
  }
}
