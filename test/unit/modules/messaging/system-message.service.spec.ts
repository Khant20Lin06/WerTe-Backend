import {
  ConversationParticipantRole,
  ConversationType,
  OrderStatus,
  SystemMessageCode,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ConversationOrderContextEntity } from '../../../../src/modules/messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { AppLogger } from '../../../../src/infrastructure/logging/app.logger';
import { MessagePolicyService } from '../../../../src/modules/messaging/policies/message-policy.service';
import { ConversationRepository } from '../../../../src/modules/messaging/repositories/conversation.repository';
import { MessageRepository } from '../../../../src/modules/messaging/repositories/message.repository';
import { MessageDeliveryService } from '../../../../src/modules/messaging/services/message-delivery.service';
import { SystemMessageService } from '../../../../src/modules/messaging/services/system-message.service';
import { SystemMessageTemplateService } from '../../../../src/modules/messaging/services/system-message-template.service';
import { NotificationEventService } from '../../../../src/modules/notifications/services/notification-event.service';
import { AuditEventService } from '../../../../src/modules/audit/services/audit-event.service';
import { SentMessageEntity } from '../../../../src/modules/messaging/entities/sent-message.entity';

function makeOrderContext(
  overrides?: Partial<ConversationOrderContextEntity>,
): ConversationOrderContextEntity {
  return {
    orderId: 'order_1',
    orderCode: 'ORD-00000001',
    status: OrderStatus.RIDER_ASSIGNED,
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_customer_1',
    },
    merchant: {
      merchantId: 'merchant_1',
      userId: 'usr_merchant_1',
      merchantName: 'Demo Merchant',
    },
    branch: {
      branchName: 'Downtown Branch',
    },
    rider: {
      riderId: 'rider_1',
      userId: 'usr_rider_1',
      displayName: 'Ko Aung',
    },
    ...overrides,
  };
}

function makeSentMessage(
  overrides?: Partial<SentMessageEntity>,
): SentMessageEntity {
  return {
    messageId: 'msg_1',
    conversationId: 'con_1',
    senderKind: 'SYSTEM',
    senderId: null,
    type: 'SYSTEM_EVENT',
    systemEventCode: SystemMessageCode.ORDER_ACCEPTED,
    body: 'Demo Merchant accepted the order.',
    metadataJson: null,
    deletedAt: null,
    createdAt: '2026-04-19T10:05:00.000Z',
    receipts: [],
    attachments: [],
    ...overrides,
  };
}

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
        participantKey: 'user:usr_rider_1',
        userId: 'usr_rider_1',
        roleAtJoin: ConversationParticipantRole.RIDER,
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

describe('SystemMessageService', () => {
  const currentUser = makeAuthenticatedUser({
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

  it('publishes a rendered system event message into the resolved order chat', async () => {
    const logger = {
      warnEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const conversationRepository = {
      findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
      resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagePolicyService = {
      buildConversationParticipants: jest.fn().mockReturnValue([
        {
          participantKey: 'user:usr_customer_1',
          userId: 'usr_customer_1',
          roleAtJoin: ConversationParticipantRole.CUSTOMER,
          canSendMessages: true,
          canSendAttachments: true,
          canSendProofs: false,
          canModerate: false,
        },
        {
          participantKey: 'user:usr_merchant_1',
          userId: 'usr_merchant_1',
          roleAtJoin: ConversationParticipantRole.MERCHANT,
          canSendMessages: true,
          canSendAttachments: true,
          canSendProofs: true,
          canModerate: false,
        },
      ]),
      buildConversationTitle: jest
        .fn()
        .mockReturnValue('ORD-00000001 order_chat'),
    } as unknown as jest.Mocked<MessagePolicyService>;
    const messageRepository = {
      createSystemEvent: jest.fn().mockResolvedValue(makeSentMessage()),
    } as unknown as jest.Mocked<MessageRepository>;
    const deliveryService = {
      emitMessageCreated: jest.fn(),
      emitConversationUpdated: jest.fn(),
      queuePushFallback: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MessageDeliveryService>;
    const notificationEventService = {
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<NotificationEventService>;
    const auditEventService = {
      publishOrderEvent: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditEventService>;
    const templateService = {
      render: jest.fn().mockResolvedValue('Demo Merchant accepted the order.'),
    } as unknown as jest.Mocked<SystemMessageTemplateService>;
    const service = new SystemMessageService(
      logger,
      conversationRepository,
      messagePolicyService,
      messageRepository,
      deliveryService,
      templateService,
      notificationEventService,
      auditEventService,
    );

    await service.publishOrderEvent(currentUser, {
      orderId: 'order_1',
      code: SystemMessageCode.ORDER_ACCEPTED,
      metadata: {
        actorUserId: currentUser.userId,
      },
      templateVariables: {
        merchantName: 'Demo Merchant',
      },
    });

    expect(templateService.render).toHaveBeenCalledWith(
      SystemMessageCode.ORDER_ACCEPTED,
      expect.objectContaining({
        orderCode: 'ORD-00000001',
        merchantName: 'Demo Merchant',
        branchName: 'Downtown Branch',
        riderName: 'Ko Aung',
      }),
    );
    expect(messageRepository.createSystemEvent).toHaveBeenCalledWith({
      conversationId: 'con_1',
      systemEventCode: SystemMessageCode.ORDER_ACCEPTED,
      body: 'Demo Merchant accepted the order.',
      metadataJson: {
        actorUserId: currentUser.userId,
      },
      receiptUserIds: ['usr_customer_1', 'usr_merchant_1', 'usr_rider_1'],
    });
    expect(deliveryService.emitMessageCreated).toHaveBeenCalled();
    expect(deliveryService.emitConversationUpdated).toHaveBeenCalledWith(
      'con_1',
    );
    expect(deliveryService.queuePushFallback).toHaveBeenCalledWith('con_1');
    expect(notificationEventService.publishOrderEvent).toHaveBeenCalled();
    expect(auditEventService.publishOrderEvent).toHaveBeenCalled();
  });

  it('swallows publish failures and logs a warning event', async () => {
    const logger = {
      warnEvent: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    const templateService = {
      render: jest.fn().mockRejectedValue(new Error('template render failed')),
    } as unknown as jest.Mocked<SystemMessageTemplateService>;
    const service = new SystemMessageService(
      logger,
      {
        findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
        resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
      } as unknown as jest.Mocked<ConversationRepository>,
      {
        buildConversationParticipants: jest.fn().mockReturnValue([
          {
            participantKey: 'user:usr_customer_1',
            userId: 'usr_customer_1',
            roleAtJoin: ConversationParticipantRole.CUSTOMER,
            canSendMessages: true,
            canSendAttachments: true,
            canSendProofs: false,
            canModerate: false,
          },
        ]),
        buildConversationTitle: jest.fn().mockReturnValue('ORD-00000001 order_chat'),
      } as unknown as jest.Mocked<MessagePolicyService>,
      {} as MessageRepository,
      {
        emitMessageCreated: jest.fn(),
        emitConversationUpdated: jest.fn(),
        queuePushFallback: jest.fn().mockResolvedValue(undefined),
      } as unknown as MessageDeliveryService,
      templateService,
      {
        publishOrderEvent: jest.fn().mockResolvedValue(undefined),
      } as unknown as NotificationEventService,
      {
        publishOrderEvent: jest.fn().mockResolvedValue(undefined),
      } as unknown as AuditEventService,
    );

    await expect(
      service.publishOrderEvent(currentUser, {
        orderId: 'order_1',
        code: SystemMessageCode.ORDER_ACCEPTED,
      }),
    ).resolves.toBeUndefined();

    expect(logger.warnEvent).toHaveBeenCalledWith(
      'System order event message could not be published.',
      expect.objectContaining({
        orderId: 'order_1',
        code: SystemMessageCode.ORDER_ACCEPTED,
        actorUserId: currentUser.userId,
      }),
      'SystemMessageService',
    );
  });
});
