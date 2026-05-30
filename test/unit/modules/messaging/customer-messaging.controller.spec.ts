import { MessageType, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { CustomerMessagingController } from '../../../../src/modules/messaging/controllers/customer-messaging.controller';
import { ConversationTypeValue } from '../../../../src/modules/messaging/dto/create-conversation.dto';
import { MessagingRestService } from '../../../../src/modules/messaging/services/messaging-rest.service';

describe('CustomerMessagingController', () => {
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

  it('delegates order conversation resolution to the messaging rest service', async () => {
    const messagingRestService = {
      resolveCurrentUserConversationForOrder: jest.fn().mockResolvedValue({
        conversationId: 'con_1',
        orderId: 'order_1',
      }),
    } as unknown as jest.Mocked<MessagingRestService>;
    const controller = new CustomerMessagingController(messagingRestService);

    const result = await controller.resolveConversation(currentUser, 'order_1', {
      type: ConversationTypeValue.orderChat,
    });

    expect(
      messagingRestService.resolveCurrentUserConversationForOrder,
    ).toHaveBeenCalledWith(currentUser, 'order_1', {
      type: ConversationTypeValue.orderChat,
    });
    expect(result).toMatchObject({
      conversationId: 'con_1',
      orderId: 'order_1',
    });
  });

  it('delegates message sends with the conversation path parameter', async () => {
    const messagingRestService = {
      sendCurrentUserMessage: jest.fn().mockResolvedValue({
        messageId: 'msg_1',
        conversationId: 'con_1',
        type: MessageType.TEXT,
      }),
    } as unknown as jest.Mocked<MessagingRestService>;
    const controller = new CustomerMessagingController(messagingRestService);

    const result = await controller.sendMessage(currentUser, 'con_1', {
      body: 'Hello there.',
    });

    expect(messagingRestService.sendCurrentUserMessage).toHaveBeenCalledWith(
      currentUser,
      'con_1',
      {
        body: 'Hello there.',
      },
    );
    expect(result).toMatchObject({
      messageId: 'msg_1',
      conversationId: 'con_1',
    });
  });

  it('delegates read receipt updates to the messaging rest service', async () => {
    const messagingRestService = {
      markCurrentUserMessageRead: jest.fn().mockResolvedValue({
        conversationId: 'con_1',
        messageId: 'msg_1',
        readAt: '2026-04-20T10:30:00.000Z',
      }),
    } as unknown as jest.Mocked<MessagingRestService>;
    const controller = new CustomerMessagingController(messagingRestService);

    const result = await controller.markRead(currentUser, 'msg_1');

    expect(messagingRestService.markCurrentUserMessageRead).toHaveBeenCalledWith(
      currentUser,
      'msg_1',
    );
    expect(result).toMatchObject({
      conversationId: 'con_1',
      messageId: 'msg_1',
    });
  });
});
