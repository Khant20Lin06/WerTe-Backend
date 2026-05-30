import {
  ConversationParticipantRole,
  ConversationType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ConversationsController } from '../../../../src/modules/messaging/controllers/conversations.controller';
import {
  CreateConversationDto,
  ConversationTypeValue,
} from '../../../../src/modules/messaging/dto/create-conversation.dto';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { ConversationService } from '../../../../src/modules/messaging/services/conversation.service';

function makeResolvedConversation(
  overrides?: Partial<ResolvedConversationEntity>,
): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.ORDER_CHAT,
    title: 'ORD-00000001 order_chat',
    lastMessageId: null,
    lastMessageAt: null,
    createdAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-19T10:00:00.000Z',
    participants: [
      {
        participantKey: 'user:usr_customer_1',
        userId: 'usr_customer_1',
        roleAtJoin: ConversationParticipantRole.CUSTOMER,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: false,
        canModerate: false,
        joinedAt: '2026-04-19T10:00:00.000Z',
        leftAt: null,
      },
    ],
    ...overrides,
  };
}

describe('ConversationsController', () => {
  it('delegates conversation resolution to the authenticated conversation service', async () => {
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
    const dto: CreateConversationDto = {
      orderId: 'order_1',
      type: ConversationTypeValue.orderChat,
    };
    const conversationService = {
      resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationService>;
    const controller = new ConversationsController(conversationService);

    const result = await controller.create(currentUser, dto);

    expect(conversationService.resolve).toHaveBeenCalledWith(currentUser, dto);
    expect(result).toMatchObject({
      conversationId: 'con_1',
      type: ConversationType.ORDER_CHAT,
    });
  });
});
