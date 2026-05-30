import { MessageType, UserRole, UserStatus } from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { MessagesController } from '../../../../src/modules/messaging/controllers/messages.controller';
import { SentMessageEntity } from '../../../../src/modules/messaging/entities/sent-message.entity';
import { MessageService } from '../../../../src/modules/messaging/services/message.service';

function makeSentMessage(
  overrides?: Partial<SentMessageEntity>,
): SentMessageEntity {
  return {
    messageId: 'msg_1',
    conversationId: 'con_1',
    senderKind: 'USER',
    senderId: 'usr_customer_1',
    type: MessageType.TEXT,
    systemEventCode: null,
    body: 'Heading out now.',
    metadataJson: null,
    deletedAt: null,
    createdAt: '2026-04-19T10:00:00.000Z',
    receipts: [],
    attachments: [],
    ...overrides,
  } as SentMessageEntity;
}

describe('MessagesController', () => {
  it('delegates sends to the authenticated message service', async () => {
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
    const messageService = {
      send: jest.fn().mockResolvedValue(makeSentMessage()),
    } as unknown as jest.Mocked<MessageService>;
    const controller = new MessagesController(messageService);

    const result = await controller.send(currentUser, {
      conversationId: 'con_1',
      body: 'Heading out now.',
    });

    expect(messageService.send).toHaveBeenCalledWith(currentUser, {
      conversationId: 'con_1',
      body: 'Heading out now.',
    });
    expect(result).toMatchObject({
      messageId: 'msg_1',
      conversationId: 'con_1',
    });
  });
});
