import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ListConversationMessagesQueryDto } from '../dto/list-conversation-messages-query.dto';
import { ListConversationsQueryDto } from '../dto/list-conversations-query.dto';
import { MarkReadDto } from '../dto/mark-read.dto';
import { ResolveConversationDto } from '../dto/resolve-conversation.dto';
import { SendConversationMessageDto } from '../dto/send-conversation-message.dto';
import { ConversationMessageListEntity } from '../entities/conversation-message-list.entity';
import { ConversationSummaryEntity } from '../entities/conversation-summary.entity';
import { MarkedMessageReadEntity } from '../entities/marked-message-read.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
import { SentMessageEntity } from '../entities/sent-message.entity';
import { MessagingRestService } from '../services/messaging-rest.service';

@ApiTags('admin-messaging')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminMessagingController {
  constructor(private readonly messagingRestService: MessagingRestService) {}

  @ApiOperation({
    operationId: 'listCurrentAdminConversations',
    summary: 'List conversations visible to the authenticated admin',
  })
  @ApiOkResponse({
    description: 'Returns current admin conversation summaries.',
    type: ConversationSummaryEntity,
    isArray: true,
  })
  @Get('conversations')
  listConversations(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Query() query: ListConversationsQueryDto,
  ) {
    return this.messagingRestService.listCurrentUserConversations(currentUser, query);
  }

  @ApiOperation({
    operationId: 'listCurrentAdminOrderConversations',
    summary: 'List order conversations visible to the authenticated admin',
  })
  @ApiParam({ name: 'orderId', example: 'order_1' })
  @ApiOkResponse({
    description: 'Returns the current admin conversation summaries for the order.',
    type: ConversationSummaryEntity,
    isArray: true,
  })
  @Get('orders/:orderId/conversations')
  listOrderConversations(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Query() query: ListConversationsQueryDto,
  ) {
    return this.messagingRestService.listCurrentUserOrderConversations(currentUser, orderId, query);
  }

  @ApiOperation({
    operationId: 'resolveCurrentAdminConversation',
    summary: 'Resolve an order-scoped conversation for the authenticated admin',
  })
  @ApiParam({ name: 'orderId', example: 'order_1' })
  @ApiBody({ type: ResolveConversationDto })
  @ApiCreatedResponse({
    description: 'Resolves and syncs an order-scoped conversation lane for the admin.',
    type: ResolvedConversationEntity,
  })
  @Post('orders/:orderId/conversations')
  resolveConversation(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('orderId') orderId: string,
    @Body() body: ResolveConversationDto,
  ) {
    return this.messagingRestService.resolveCurrentUserConversationForOrder(currentUser, orderId, body);
  }

  @ApiOperation({
    operationId: 'getCurrentAdminConversation',
    summary: 'Get an admin-visible conversation summary',
  })
  @ApiParam({ name: 'conversationId', example: 'con_1' })
  @ApiOkResponse({
    description: 'Returns the requested admin-visible conversation summary.',
    type: ConversationSummaryEntity,
  })
  @Get('conversations/:conversationId')
  getConversation(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagingRestService.getCurrentUserConversation(currentUser, conversationId);
  }

  @ApiOperation({
    operationId: 'listCurrentAdminConversationMessages',
    summary: 'List messages visible to the authenticated admin in a conversation',
  })
  @ApiParam({ name: 'conversationId', example: 'con_1' })
  @ApiOkResponse({
    description: 'Returns a paginated admin-visible message list.',
    type: ConversationMessageListEntity,
  })
  @Get('conversations/:conversationId/messages')
  listMessages(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('conversationId') conversationId: string,
    @Query() query: ListConversationMessagesQueryDto,
  ) {
    return this.messagingRestService.listCurrentUserConversationMessages(currentUser, conversationId, query);
  }

  @ApiOperation({
    operationId: 'sendCurrentAdminConversationMessage',
    summary: 'Send a message from the authenticated admin into a conversation',
  })
  @ApiParam({ name: 'conversationId', example: 'con_1' })
  @ApiBody({ type: SendConversationMessageDto })
  @ApiCreatedResponse({
    description: 'Persists a new admin message in the conversation.',
    type: SentMessageEntity,
  })
  @Post('conversations/:conversationId/messages')
  sendMessage(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('conversationId') conversationId: string,
    @Body() body: SendConversationMessageDto,
  ) {
    return this.messagingRestService.sendCurrentUserMessage(currentUser, conversationId, body);
  }

  @ApiOperation({
    operationId: 'markCurrentAdminMessageRead',
    summary: 'Record an admin read receipt for a message',
  })
  @ApiParam({ name: 'messageId', example: 'msg_1' })
  @ApiOkResponse({
    description: 'Records the admin read position for the message conversation.',
    type: MarkReadDto,
  })
  @Post('messages/:messageId/read')
  markRead(
    @CurrentUser() currentUser: AuthenticatedUserEntity,
    @Param('messageId') messageId: string,
  ): Promise<MarkedMessageReadEntity> {
    return this.messagingRestService.markCurrentUserMessageRead(currentUser, messageId);
  }
}
