import {
  ConversationParticipantRole,
  ConversationType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { ConversationRepository } from '../../../../src/modules/messaging/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/modules/messaging/repositories/message.repository';
import { MessageDeliveryService } from '../../../../src/modules/messaging/services/message-delivery.service';
import { MessageReceiptService } from '../../../../src/modules/messaging/services/message-receipt.service';
import { MessagingPolicyService } from '../../../../src/modules/messaging/services/message-policy.service';

function makeConversation(
  overrides?: Partial<ResolvedConversationEntity>,
): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.ORDER_CHAT,
    title: 'ORD-00000001 order_chat',
    lastMessageId: 'msg_2',
    lastMessageAt: '2026-04-20T10:05:00.000Z',
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:05:00.000Z',
    participants: [
      {
        participantKey: 'user:usr_customer_1',
        userId: 'usr_customer_1',
        roleAtJoin: ConversationParticipantRole.CUSTOMER,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: false,
        canModerate: false,
        lastReadMessageId: null,
        lastReadAt: null,
        joinedAt: '2026-04-20T10:00:00.000Z',
        leftAt: null,
      },
    ],
    ...overrides,
  };
}

describe('MessageReceiptService', () => {
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

  it('marks the conversation read position for the authenticated actor', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      findMessageReadContextById: jest.fn().mockResolvedValue({
        id: 'msg_2',
        conversationId: 'con_1',
      }),
      markConversationReadUpTo: jest.fn().mockResolvedValue({
        conversationId: 'con_1',
        messageId: 'msg_2',
        readAt: '2026-04-20T10:06:00.000Z',
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      findActiveParticipant: jest.fn().mockReturnValue(
        makeConversation().participants[0],
      ),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const messageDeliveryService = {
      emitMessageRead: jest.fn(),
      emitConversationUpdated: jest.fn(),
    } as unknown as jest.Mocked<MessageDeliveryService>;
    const service = new MessageReceiptService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
      messageDeliveryService,
    );

    const result = await service.markMessageRead(currentUser, 'msg_2');

    expect(messageRepository.markConversationReadUpTo).toHaveBeenCalledWith({
      conversationId: 'con_1',
      targetMessageId: 'msg_2',
      userId: 'usr_customer_1',
    });
    expect(result).toMatchObject({
      conversationId: 'con_1',
      messageId: 'msg_2',
    });
    expect(messageDeliveryService.emitMessageRead).toHaveBeenCalledWith({
      conversationId: 'con_1',
      messageId: 'msg_2',
      readAt: '2026-04-20T10:06:00.000Z',
    });
    expect(messageDeliveryService.emitConversationUpdated).toHaveBeenCalledWith(
      'con_1',
    );
  });

  it('rejects mark-read requests when the actor cannot access the conversation', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      findMessageReadContextById: jest.fn().mockResolvedValue({
        id: 'msg_2',
        conversationId: 'con_1',
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new MessageReceiptService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
      {} as MessageDeliveryService,
    );

    await expect(
      service.markMessageRead(currentUser, 'msg_2'),
    ).rejects.toBeInstanceOf(AppException);
  });
});
