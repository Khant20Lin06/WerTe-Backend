import {
  ConversationParticipantRole,
  ConversationType,
  MessageAttachmentType,
  MessageAttachmentVisibility,
  MessageDeliveryStatus,
  MessageType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../../../src/modules/messaging/entities/sent-message.entity';
import { SendMessageDto, SendMessageTypeValue } from '../../../../src/modules/messaging/dto/send-message.dto';
import { MessageService } from '../../../../src/modules/messaging/services/message.service';
import { ConversationRepository } from '../../../../src/modules/messaging/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/modules/messaging/repositories/message.repository';
import { MessagingPolicyService } from '../../../../src/modules/messaging/services/message-policy.service';
import { MessageDeliveryService } from '../../../../src/modules/messaging/services/message-delivery.service';
import { SendMessageAttachmentTypeValue } from '../../../../src/modules/messaging/dto/send-message-attachment.dto';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { AuditEventService } from '../../../../src/modules/audit/services/audit-event.service';

function makeConversation(
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
      {
        participantKey: 'user:usr_merchant_1',
        userId: 'usr_merchant_1',
        roleAtJoin: ConversationParticipantRole.MERCHANT,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: true,
        canModerate: false,
        joinedAt: '2026-04-19T10:00:00.000Z',
        leftAt: null,
      },
      {
        participantKey: 'system:order-chat',
        userId: null,
        roleAtJoin: ConversationParticipantRole.SYSTEM,
        canSendMessages: false,
        canSendAttachments: false,
        canSendProofs: false,
        canModerate: false,
        joinedAt: '2026-04-19T10:00:00.000Z',
        leftAt: null,
      },
    ],
    ...overrides,
  };
}

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
    receipts: [
      {
        userId: 'usr_customer_1',
        status: MessageDeliveryStatus.READ,
        deliveredAt: '2026-04-19T10:00:00.000Z',
        readAt: '2026-04-19T10:00:00.000Z',
      },
      {
        userId: 'usr_merchant_1',
        status: MessageDeliveryStatus.DELIVERED,
        deliveredAt: '2026-04-19T10:00:00.000Z',
        readAt: null,
      },
    ],
    attachments: [],
    ...overrides,
  } as SentMessageEntity;
}

describe('MessageService', () => {
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

  it('derives sender from the authenticated actor and persists receipts for active user participants', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
      findOrderContextById: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      create: jest.fn().mockResolvedValue(makeSentMessage()),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      canSendMessage: jest.fn().mockReturnValue(true),
      canSendAttachment: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const messageDeliveryService = {
      emitMessageCreated: jest.fn(),
      emitConversationUpdated: jest.fn(),
      queuePushFallback: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MessageDeliveryService>;
    const notificationEventService = {
      publishConversationMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationEventService>;
    const auditEventService = {
      publishConversationMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditEventService>;
    const service = new MessageService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
      messageDeliveryService,
      notificationEventService,
      auditEventService,
    );

    const result = await service.send(currentUser, {
      conversationId: 'con_1',
      body: 'Heading out now.',
    });

    expect(messageRepository.create).toHaveBeenCalledWith({
      conversationId: 'con_1',
      senderKind: 'USER',
      senderId: 'usr_customer_1',
      type: MessageType.TEXT,
      body: 'Heading out now.',
      attachments: [],
      receiptUserIds: ['usr_customer_1', 'usr_merchant_1'],
    });
    expect(messageDeliveryService.queuePushFallback).toHaveBeenCalledWith(
      'con_1',
    );
    expect(notificationEventService.publishConversationMessage).toHaveBeenCalled();
    expect(auditEventService.publishConversationMessage).toHaveBeenCalled();
    expect(result).toMatchObject({
      messageId: 'msg_1',
      senderId: 'usr_customer_1',
    });
  });

  it('rejects proof messages when the actor lacks proof permission', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      canSendMessage: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new MessageService(
      conversationRepository,
      {} as MessageRepository,
      messagingPolicyService,
      {} as MessageDeliveryService,
      {} as NotificationEventService,
      {} as AuditEventService,
    );

    await expect(
      service.send(currentUser, {
        conversationId: 'con_1',
        type: SendMessageTypeValue.proofOfDelivery,
        attachments: [
          {
            type: SendMessageAttachmentTypeValue.proofOfDelivery,
            storageKey: 'proofs/order_1/proof_1.jpg',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('rejects image/proof payloads when attachment types do not match the selected message type', async () => {
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      canSendMessage: jest.fn().mockReturnValue(true),
      canSendAttachment: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new MessageService(
      conversationRepository,
      {} as MessageRepository,
      messagingPolicyService,
      {} as MessageDeliveryService,
      {} as NotificationEventService,
      {} as AuditEventService,
    );

    await expect(
      service.send(currentUser, {
        conversationId: 'con_1',
        type: SendMessageTypeValue.image,
        attachments: [
          {
            type: SendMessageAttachmentTypeValue.file,
            storageKey: 'files/order_1/file_1.pdf',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('maps proof attachment visibility for merchant/rider proof payloads', async () => {
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
    const conversationRepository = {
      findResolvedById: jest.fn().mockResolvedValue(makeConversation()),
      findOrderContextById: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messageRepository = {
      create: jest.fn().mockResolvedValue(
        makeSentMessage({
          type: MessageType.PROOF_OF_HANDOFF,
          attachments: [
            {
              type: MessageAttachmentType.PROOF_OF_HANDOFF,
              visibility: MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
              storageKey: 'proofs/order_1/handoff_1.jpg',
              fileName: 'handoff.jpg',
              mimeType: 'image/jpeg',
              fileSizeBytes: 1024,
              width: 1200,
              height: 900,
              createdAt: '2026-04-19T10:00:00.000Z',
            },
          ],
        }),
      ),
    } as unknown as jest.Mocked<MessageRepository>;
    const messagingPolicyService = {
      canAccessConversation: jest.fn().mockReturnValue(true),
      canSendMessage: jest.fn().mockReturnValue(true),
      canSendAttachment: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<MessagingPolicyService>;
    const service = new MessageService(
      conversationRepository,
      messageRepository,
      messagingPolicyService,
      {
        emitMessageCreated: jest.fn(),
        emitConversationUpdated: jest.fn(),
        queuePushFallback: jest.fn().mockResolvedValue(undefined),
      } as unknown as jest.Mocked<MessageDeliveryService>,
      {
        publishConversationMessage: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationEventService,
      {
        publishConversationMessage: jest.fn().mockResolvedValue(undefined),
      } as unknown as AuditEventService,
    );

    await service.send(merchantUser, {
      conversationId: 'con_1',
      type: SendMessageTypeValue.proofOfHandoff,
      attachments: [
        {
          type: SendMessageAttachmentTypeValue.proofOfHandoff,
          storageKey: 'proofs/order_1/handoff_1.jpg',
          fileName: 'handoff.jpg',
        },
      ],
    });

    expect(messageRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            type: MessageAttachmentType.PROOF_OF_HANDOFF,
            visibility:
              MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
          }),
        ],
      }),
    );
  });
});
