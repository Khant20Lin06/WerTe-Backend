import {
  ConversationParticipantRole,
  ConversationType,
  MessageAttachmentVisibility,
  MessageDeliveryStatus,
  MessageType,
  SystemMessageCode,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import {
  ConversationMessageRecord,
} from '../../../../src/modules/messaging/entities/conversation-message-list.entity';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { MessageReadService } from '../../../../src/modules/messaging/services/message-read.service';
import { ConversationRepository } from '../../../../src/modules/messaging/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/modules/messaging/repositories/message.repository';
import { MessagingPolicyService } from '../../../../src/modules/messaging/services/message-policy.service';

function makeResolvedConversation(
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

function makeMessageRecord(
  overrides?: Partial<ConversationMessageRecord>,
): ConversationMessageRecord {
  return {
    id: 'msg_1',
    conversationId: 'con_1',
    senderKind: 'USER',
    senderId: 'usr_merchant_1',
    type: MessageType.PROOF_OF_HANDOFF,
    systemEventCode: null,
    body: 'Please check this handoff photo.',
    metadataJson: null,
    deletedAt: null,
    createdAt: new Date('2026-04-20T10:05:00.000Z'),
    sender: {
      id: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      customerProfile: null,
      riderProfile: null,
      merchantProfile: {
        name: 'Demo Merchant',
      },
    },
    attachments: [
      {
        type: 'PROOF_OF_HANDOFF',
        visibility: MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
        storageKey: 'proofs/order_1/handoff_1.jpg',
        fileName: 'handoff.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 1024,
        width: 1200,
        height: 900,
        createdAt: new Date('2026-04-20T10:05:00.000Z'),
      },
    ],
    receipts: [
      {
        userId: 'usr_customer_1',
        status: MessageDeliveryStatus.DELIVERED,
        deliveredAt: new Date('2026-04-20T10:05:00.000Z'),
        readAt: null,
      },
    ],
    ...overrides,
  } as ConversationMessageRecord;
}

describe('MessageReadService', () => {
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

  it('filters attachment visibility based on the viewer participant role', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      listConversationMessages: jest.fn().mockResolvedValue({
        records: [makeMessageRecord()],
        nextCursor: null,
        hasMore: false,
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      findActiveParticipant: jest.fn().mockReturnValue(
        makeResolvedConversation().participants[0],
      ),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new MessageReadService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
    );

    const result = await service.listCurrentUserConversationMessages(
      currentUser,
      {
        conversationId: 'con_1',
      },
    );

    expect(result).toMatchObject({
      conversationId: 'con_1',
      hasMore: false,
      messages: [
        {
          messageId: 'msg_1',
          senderDisplayName: 'Demo Merchant',
          attachments: [],
        },
      ],
    });
  });

  it('preserves system events and pagination cursors for readable message pages', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      listConversationMessages: jest.fn().mockResolvedValue({
        records: [
          makeMessageRecord({
            id: 'msg_2',
            senderKind: 'SYSTEM',
            senderId: null,
            type: MessageType.SYSTEM_EVENT,
            systemEventCode: SystemMessageCode.ORDER_PICKED_UP,
            body: 'Ko Aung picked up the order.',
            sender: null,
            attachments: [],
          }),
        ],
        nextCursor: 'msg_2',
        hasMore: true,
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      findActiveParticipant: jest.fn().mockReturnValue(
        makeResolvedConversation({
          participants: [
            {
              participantKey: 'user:usr_merchant_1',
              userId: 'usr_merchant_1',
              roleAtJoin: ConversationParticipantRole.MERCHANT,
              canSendMessages: true,
              canSendAttachments: true,
              canSendProofs: true,
              canModerate: false,
              lastReadMessageId: null,
              lastReadAt: null,
              joinedAt: '2026-04-20T10:00:00.000Z',
              leftAt: null,
            },
          ],
        }).participants[0],
      ),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const merchantUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0942000000',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });
    const service = new MessageReadService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
    );

    const result = await service.listCurrentUserConversationMessages(
      merchantUser,
      {
        conversationId: 'con_1',
        cursor: 'msg_10',
        limit: 10,
      },
    );

    expect(result).toMatchObject({
      conversationId: 'con_1',
      nextCursor: 'msg_2',
      hasMore: true,
      messages: [
        {
          messageId: 'msg_2',
          senderKind: 'SYSTEM',
          senderDisplayName: 'System',
          systemEventCode: SystemMessageCode.ORDER_PICKED_UP,
        },
      ],
    });
  });

  it('returns proof attachments to merchant viewers that are allowed to see them', async () => {
    const merchantConversation = makeResolvedConversation({
      participants: [
        {
          participantKey: 'user:usr_merchant_1',
          userId: 'usr_merchant_1',
          roleAtJoin: ConversationParticipantRole.MERCHANT,
          canSendMessages: true,
          canSendAttachments: true,
          canSendProofs: true,
          canModerate: false,
          lastReadMessageId: null,
          lastReadAt: null,
          joinedAt: '2026-04-20T10:00:00.000Z',
          leftAt: null,
        },
      ],
    });
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(merchantConversation),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      listConversationMessages: jest.fn().mockResolvedValue({
        records: [makeMessageRecord()],
        nextCursor: null,
        hasMore: false,
      }),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      findActiveParticipant: jest.fn().mockReturnValue(
        merchantConversation.participants[0],
      ),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const merchantUser = makeAuthenticatedUser({
      userId: 'usr_merchant_1',
      role: UserRole.MERCHANT,
      actorContext: {
        userId: 'usr_merchant_1',
        phone: '0942000000',
        role: UserRole.MERCHANT,
        status: UserStatus.ACTIVE,
        merchantId: 'merchant_1',
      },
    });
    const service = new MessageReadService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
    );

    const result = await service.listCurrentUserConversationMessages(
      merchantUser,
      {
        conversationId: 'con_1',
      },
    );

    expect(result.messages[0]?.attachments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          storageKey: 'proofs/order_1/handoff_1.jpg',
          visibility: MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
        }),
      ]),
    );
  });

  it('rejects reads when the actor is not an active conversation participant', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      findActiveParticipant: jest.fn().mockReturnValue(null),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new MessageReadService(
      conversationRepository,
      {} as MessageRepository,
      messagingPolicyService,
    );

    await expect(
      service.listCurrentUserConversationMessages(currentUser, {
        conversationId: 'con_1',
      }),
    ).rejects.toBeInstanceOf(AppException);
  });
});
