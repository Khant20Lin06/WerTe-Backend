import {
  ConversationParticipantRole,
  ConversationType,
  MessageType,
  OrderStatus,
  SystemMessageCode,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  ConversationSummaryRecord,
} from '../../../../src/modules/messaging/entities/conversation-summary.entity';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { ConversationReadService } from '../../../../src/modules/messaging/services/conversation-read.service';
import { ConversationRepository } from '../../../../src/modules/messaging/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/modules/messaging/repositories/message.repository';
import { MessagingPolicyService } from '../../../../src/modules/messaging/services/message-policy.service';

function makeConversationSummaryRecord(
  overrides?: Partial<ConversationSummaryRecord>,
): ConversationSummaryRecord {
  return {
    id: 'con_1',
    orderId: 'order_1',
    type: ConversationType.ORDER_CHAT,
    title: 'ORD-00000001 order_chat',
    lastMessageId: 'msg_1',
    lastMessageAt: new Date('2026-04-20T10:05:00.000Z'),
    createdAt: new Date('2026-04-20T10:00:00.000Z'),
    updatedAt: new Date('2026-04-20T10:05:00.000Z'),
    order: {
      orderCode: 'ORD-00000001',
      status: OrderStatus.RIDER_ASSIGNED,
    },
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
        leftAt: null,
      },
    ],
    lastMessage: {
      id: 'msg_1',
      senderKind: 'SYSTEM',
      senderId: null,
      type: MessageType.SYSTEM_EVENT,
      systemEventCode: SystemMessageCode.RIDER_ASSIGNED,
      body: 'Ko Aung was assigned to deliver the order.',
      createdAt: new Date('2026-04-20T10:05:00.000Z'),
      attachments: [],
    },
    ...overrides,
  } as ConversationSummaryRecord;
}

function makeResolvedConversation(
  overrides?: Partial<ResolvedConversationEntity>,
): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.ORDER_CHAT,
    title: 'ORD-00000001 order_chat',
    lastMessageId: 'msg_1',
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

describe('ConversationReadService', () => {
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

  it('lists current user conversations with unread counts', async () => {
    const conversationRepository = {
      listConversationSummaryRecordsForUser: jest
        .fn()
        .mockResolvedValue([makeConversationSummaryRecord()]),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      countUnreadByConversationIds: jest.fn().mockResolvedValue({
        con_1: 3,
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const service = new ConversationReadService(
      conversationRepository,
      messageRepository,
      {} as MessagingPolicyService,
    );

    const result = await service.listCurrentUserConversations(currentUser);

    expect(result).toMatchObject([
      {
        conversationId: 'con_1',
        unreadCount: 3,
        preview: {
          messageId: 'msg_1',
          systemEventCode: SystemMessageCode.RIDER_ASSIGNED,
        },
      },
    ]);
  });

  it('passes order-scoped filters through when listing order conversations', async () => {
    const conversationRepository = {
      listConversationSummaryRecordsForUser: jest
        .fn()
        .mockResolvedValue([makeConversationSummaryRecord()]),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      countUnreadByConversationIds: jest.fn().mockResolvedValue({
        con_1: 1,
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const service = new ConversationReadService(
      conversationRepository,
      messageRepository,
      {} as MessagingPolicyService,
    );

    await service.listCurrentUserOrderConversations(currentUser, 'order_1', 15);

    expect(
      conversationRepository.listConversationSummaryRecordsForUser,
    ).toHaveBeenCalledWith('usr_customer_1', 15, 'order_1');
  });

  it('rejects conversation detail reads when the actor lacks access', async () => {
    const conversationRepository = {
      findConversationSummaryRecordById: jest
        .fn()
        .mockResolvedValue(makeConversationSummaryRecord()),
      findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new ConversationReadService(
      conversationRepository,
      {} as MessageRepository,
      messagingPolicyService,
    );

    await expect(
      service.getCurrentUserConversation(currentUser, 'con_1'),
    ).rejects.toBeInstanceOf(AppException);
  });
});
