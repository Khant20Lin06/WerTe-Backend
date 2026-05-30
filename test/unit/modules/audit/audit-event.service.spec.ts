import {
  AuditActionSource,
  AuditActorType,
  ConversationParticipantRole,
  ConversationType,
  MessageType,
  SystemMessageCode,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AuditEventService } from '../../../../src/modules/audit/services/audit-event.service';
import { AuditService } from '../../../../src/modules/audit/services/audit.service';
import { AuthenticatedUserEntity } from '../../../../src/modules/auth/entities/authenticated-user.entity';
import { createSystemAuthenticatedActor } from '../../../../src/modules/auth/entities/system-authenticated-actor.helper';
import { ConversationOrderContextEntity } from '../../../../src/modules/messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import { SentMessageEntity } from '../../../../src/modules/messaging/entities/sent-message.entity';

function makeCurrentUser(): AuthenticatedUserEntity {
  return {
    userId: 'usr_admin_1',
    sessionId: 'session_1',
    role: UserRole.ADMIN,
    tokenType: 'access',
    actorContext: {
      userId: 'usr_admin_1',
      phone: '099999999',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  };
}

function makeOrder(): ConversationOrderContextEntity {
  return {
    orderId: 'order_1',
    orderCode: 'ORD-001',
    status: 'RIDER_ASSIGNED',
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
  };
}

function makeConversation(): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.ORDER_CHAT,
    title: 'Order Chat',
    lastMessageId: null,
    lastMessageAt: null,
    createdAt: '2026-04-23T10:00:00.000Z',
    updatedAt: '2026-04-23T10:00:00.000Z',
    participants: [
      {
        participantKey: 'user:usr_admin_1',
        userId: 'usr_admin_1',
        roleAtJoin: ConversationParticipantRole.ADMIN,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: false,
        canModerate: true,
        joinedAt: '2026-04-23T10:00:00.000Z',
        leftAt: null,
      },
    ],
  };
}

function makeMessage(): SentMessageEntity {
  return {
    messageId: 'msg_1',
    conversationId: 'con_1',
    senderKind: 'SYSTEM',
    senderId: null,
    type: MessageType.SYSTEM_EVENT,
    systemEventCode: SystemMessageCode.RIDER_ASSIGNED,
    body: 'Rider assigned.',
    metadataJson: null,
    deletedAt: null,
    createdAt: '2026-04-23T10:01:00.000Z',
    receipts: [],
    attachments: [],
  };
}

describe('AuditEventService', () => {
  it('logs order events with mapped actions', async () => {
    const auditService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditEventService(auditService);

    await service.publishOrderEvent({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: makeMessage(),
      code: SystemMessageCode.RIDER_ASSIGNED,
      metadataJson: {
        deliveryId: 'delivery_1',
      },
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'dispatch.rider_assigned',
        resourceType: 'DELIVERY',
        orderId: 'order_1',
        conversationId: 'con_1',
        messageId: 'msg_1',
      }),
    );
  });

  it('logs user message events against the message resource', async () => {
    const auditService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditEventService(auditService);

    await service.publishConversationMessage({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: {
        ...makeMessage(),
        senderKind: 'USER',
        senderId: 'usr_admin_1',
        type: MessageType.TEXT,
        systemEventCode: null,
      },
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'messaging.message_sent',
        resourceType: 'MESSAGE',
        resourceId: 'msg_1',
      }),
    );
  });

  it('maps payment system events to the payment audit resource', async () => {
    const auditService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditEventService(auditService);

    await service.publishOrderEvent({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: {
        ...makeMessage(),
        systemEventCode: SystemMessageCode.PAYMENT_SUCCEEDED,
      },
      code: SystemMessageCode.PAYMENT_SUCCEEDED,
      metadataJson: {
        paymentId: 'payment_1',
      },
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'payments.succeeded',
        resourceType: 'PAYMENT',
        resourceId: 'payment_1',
      }),
    );
  });

  it('maps refund system events to the refund audit resource', async () => {
    const auditService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditEventService(auditService);

    await service.publishOrderEvent({
      currentUser: makeCurrentUser(),
      order: makeOrder(),
      conversation: makeConversation(),
      message: {
        ...makeMessage(),
        systemEventCode: SystemMessageCode.REFUND_SUCCEEDED,
      },
      code: SystemMessageCode.REFUND_SUCCEEDED,
      metadataJson: {
        refundId: 'refund_1',
        paymentId: 'payment_1',
      },
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'refunds.succeeded',
        resourceType: 'REFUND',
        resourceId: 'refund_1',
      }),
    );
  });

  it('logs virtual system actors without a user foreign key', async () => {
    const auditService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditService>;
    const service = new AuditEventService(auditService);

    await service.publishOrderEvent({
      currentUser: createSystemAuthenticatedActor('payment-provider-webhook'),
      order: makeOrder(),
      conversation: makeConversation(),
      message: {
        ...makeMessage(),
        systemEventCode: SystemMessageCode.PAYMENT_SUCCEEDED,
      },
      code: SystemMessageCode.PAYMENT_SUCCEEDED,
      metadataJson: {
        paymentId: 'payment_1',
      },
    });

    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actorType: AuditActorType.SYSTEM,
        actorUserId: null,
        actorRole: null,
        actionSource: AuditActionSource.SYSTEM,
        metadataJson: expect.objectContaining({
          systemActorId: 'system:payment-provider-webhook',
        }),
      }),
    );
  });
});
