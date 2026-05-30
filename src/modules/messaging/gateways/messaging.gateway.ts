import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { JoinConversationDto } from '../dto/join-conversation.dto';
import { MarkMessageReadRequestDto } from '../dto/mark-message-read-request.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { ConversationReadService } from '../services/conversation-read.service';
import { MessageDeliveryService } from '../services/message-delivery.service';
import { MessageReceiptService } from '../services/message-receipt.service';
import { MessageService } from '../services/message.service';
import { MessagingSocketAuthService } from '../services/messaging-socket-auth.service';

@WebSocketGateway({
  namespace: '/messaging',
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly messagingSocketAuthService: MessagingSocketAuthService,
    private readonly conversationReadService: ConversationReadService,
    private readonly messageService: MessageService,
    private readonly messageReceiptService: MessageReceiptService,
    private readonly messageDeliveryService: MessageDeliveryService,
  ) {}

  afterInit(server: Server) {
    this.messageDeliveryService.attachServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      client.data.currentUser =
        await this.messagingSocketAuthService.authenticateClient(client);
    } catch (_error) {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('conversation.join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationDto,
  ) {
    const currentUser = this.getCurrentUserOrThrow(client);
    const conversation =
      await this.conversationReadService.getCurrentUserConversation(
        currentUser,
        payload.conversationId,
      );

    await client.join(payload.conversationId);

    return {
      conversationId: payload.conversationId,
      joined: true,
      conversation,
    };
  }

  @SubscribeMessage('conversation.leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationDto,
  ) {
    this.getCurrentUserOrThrow(client);
    await client.leave(payload.conversationId);

    return {
      conversationId: payload.conversationId,
      left: true,
    };
  }

  @SubscribeMessage('message.send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    const currentUser = this.getCurrentUserOrThrow(client);

    return this.messageService.send(currentUser, payload);
  }

  @SubscribeMessage('message.read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MarkMessageReadRequestDto,
  ) {
    const currentUser = this.getCurrentUserOrThrow(client);

    return this.messageReceiptService.markMessageRead(
      currentUser,
      payload.messageId,
    );
  }

  private getCurrentUserOrThrow(client: Socket): AuthenticatedUserEntity {
    const currentUser = client.data.currentUser as
      | AuthenticatedUserEntity
      | undefined;

    if (currentUser === undefined) {
      throw new WsException('Unauthenticated socket connection.');
    }

    return currentUser;
  }
}
