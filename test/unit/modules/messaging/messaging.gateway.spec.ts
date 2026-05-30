import { WsException } from '@nestjs/websockets';
import { UserRole, UserStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { MessagingGateway } from '../../../../src/modules/messaging/gateways/messaging.gateway';
import { ConversationReadService } from '../../../../src/modules/messaging/services/conversation-read.service';
import { MessageDeliveryService } from '../../../../src/modules/messaging/services/message-delivery.service';
import { MessageReceiptService } from '../../../../src/modules/messaging/services/message-receipt.service';
import { MessageService } from '../../../../src/modules/messaging/services/message.service';
import { MessagingSocketAuthService } from '../../../../src/modules/messaging/services/messaging-socket-auth.service';

describe('MessagingGateway', () => {
  const currentUser = makeAuthenticatedUser({
    userId: 'usr_customer_1',
    role: UserRole.CUSTOMER,
    actorContext: {
      userId: 'usr_customer_1',
      phone: '09123456789',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfileId: 'cust_prof_1',
    },
  });

  it('attaches the socket server to the delivery service on init', () => {
    const messageDeliveryService = {
      attachServer: jest.fn(),
    } as unknown as jest.Mocked<MessageDeliveryService>;
    const gateway = new MessagingGateway(
      {} as MessagingSocketAuthService,
      {} as ConversationReadService,
      {} as MessageService,
      {} as MessageReceiptService,
      messageDeliveryService,
    );
    const server = {} as Server;

    gateway.afterInit(server);

    expect(messageDeliveryService.attachServer).toHaveBeenCalledWith(server);
  });

  it('authenticates incoming socket connections and stores the actor context', async () => {
    const socketAuthService = {
      authenticateClient: jest.fn().mockResolvedValue(currentUser),
    } as unknown as jest.Mocked<MessagingSocketAuthService>;
    const gateway = new MessagingGateway(
      socketAuthService,
      {} as ConversationReadService,
      {} as MessageService,
      {} as MessageReceiptService,
      {} as MessageDeliveryService,
    );
    const client = {
      data: {},
    } as Socket;

    await gateway.handleConnection(client);

    expect(socketAuthService.authenticateClient).toHaveBeenCalledWith(client);
    expect(client.data.currentUser).toEqual(currentUser);
  });

  it('disconnects unauthorized socket connections', async () => {
    const socketAuthService = {
      authenticateClient: jest.fn().mockRejectedValue(new Error('bad token')),
    } as unknown as jest.Mocked<MessagingSocketAuthService>;
    const gateway = new MessagingGateway(
      socketAuthService,
      {} as ConversationReadService,
      {} as MessageService,
      {} as MessageReceiptService,
      {} as MessageDeliveryService,
    );
    const client = {
      data: {},
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(client);

    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('joins a conversation room after access validation', async () => {
    const conversationReadService = {
      getCurrentUserConversation: jest.fn().mockResolvedValue({
        conversationId: 'con_1',
      }),
    } as unknown as jest.Mocked<ConversationReadService>;
    const gateway = new MessagingGateway(
      {} as MessagingSocketAuthService,
      conversationReadService,
      {} as MessageService,
      {} as MessageReceiptService,
      {} as MessageDeliveryService,
    );
    const client = {
      data: {
        currentUser,
      },
      join: jest.fn(),
    } as unknown as Socket;

    const result = await gateway.handleJoin(client, {
      conversationId: 'con_1',
    });

    expect(conversationReadService.getCurrentUserConversation).toHaveBeenCalledWith(
      currentUser,
      'con_1',
    );
    expect(client.join).toHaveBeenCalledWith('con_1');
    expect(result).toMatchObject({
      conversationId: 'con_1',
      joined: true,
    });
  });

  it('delegates socket message sends to the message service', async () => {
    const messageService = {
      send: jest.fn().mockResolvedValue({
        messageId: 'msg_1',
        conversationId: 'con_1',
      }),
    } as unknown as jest.Mocked<MessageService>;
    const gateway = new MessagingGateway(
      {} as MessagingSocketAuthService,
      {} as ConversationReadService,
      messageService,
      {} as MessageReceiptService,
      {} as MessageDeliveryService,
    );
    const client = {
      data: {
        currentUser,
      },
    } as Socket;

    const result = await gateway.handleSend(client, {
      conversationId: 'con_1',
      body: 'Hello',
    });

    expect(messageService.send).toHaveBeenCalledWith(currentUser, {
      conversationId: 'con_1',
      body: 'Hello',
    });
    expect(result).toMatchObject({
      messageId: 'msg_1',
    });
  });

  it('delegates socket read receipts to the receipt service', async () => {
    const messageReceiptService = {
      markMessageRead: jest.fn().mockResolvedValue({
        conversationId: 'con_1',
        messageId: 'msg_1',
      }),
    } as unknown as jest.Mocked<MessageReceiptService>;
    const gateway = new MessagingGateway(
      {} as MessagingSocketAuthService,
      {} as ConversationReadService,
      {} as MessageService,
      messageReceiptService,
      {} as MessageDeliveryService,
    );
    const client = {
      data: {
        currentUser,
      },
    } as Socket;

    const result = await gateway.handleMarkRead(client, {
      messageId: 'msg_1',
    });

    expect(messageReceiptService.markMessageRead).toHaveBeenCalledWith(
      currentUser,
      'msg_1',
    );
    expect(result).toMatchObject({
      conversationId: 'con_1',
    });
  });

  it('throws when websocket events are received without an authenticated actor', async () => {
    const gateway = new MessagingGateway(
      {} as MessagingSocketAuthService,
      {} as ConversationReadService,
      {} as MessageService,
      {} as MessageReceiptService,
      {} as MessageDeliveryService,
    );

    await expect(
      gateway.handleSend({ data: {} } as Socket, {
        conversationId: 'con_1',
        body: 'Hello',
      }),
    ).rejects.toBeInstanceOf(WsException);
  });
});
