import {
  ConversationParticipantRole,
  ConversationType,
  OrderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { AppException } from '../../../../src/common/exceptions/app.exception';
import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ConversationOrderContextEntity } from '../../../../src/modules/messaging/entities/conversation-order-context.entity';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import {
  ConversationService,
} from '../../../../src/modules/messaging/services/conversation.service';
import { ConversationRepository } from '../../../../src/modules/messaging/repositories/conversation.repository';
import { CreateConversationDto, ConversationTypeValue } from '../../../../src/modules/messaging/dto/create-conversation.dto';
import { MessagePolicyService } from '../../../../src/modules/messaging/policies/message-policy.service';

function makeOrderContext(
  overrides?: Partial<ConversationOrderContextEntity>,
): ConversationOrderContextEntity {
  return {
    orderId: 'order_1',
    orderCode: 'ORD-00000001',
    status: OrderStatus.PLACED,
    customer: {
      customerProfileId: 'cust_prof_1',
      userId: 'usr_customer_1',
    },
    merchant: {
      merchantId: 'merchant_1',
      userId: 'usr_merchant_1',
      merchantName: 'Merchant One',
    },
    branch: {
      branchName: 'Downtown Branch',
    },
    rider: null,
    ...overrides,
  };
}

function makeResolvedConversation(
  overrides?: Partial<ResolvedConversationEntity>,
): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.CUSTOMER_MERCHANT,
    title: 'ORD-00000001 customer_merchant',
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

describe('ConversationService', () => {
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
    type: ConversationTypeValue.customerMerchant,
  };

  it('resolves a conversation lane with policy-derived participants', async () => {
    const conversationRepository = {
      findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
      resolve: jest.fn().mockResolvedValue(makeResolvedConversation()),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagePolicyService = {
      canResolveConversation: jest.fn().mockReturnValue(true),
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
        .mockReturnValue('ORD-00000001 customer_merchant'),
    } as unknown as jest.Mocked<MessagePolicyService>;
    const service = new ConversationService(
      conversationRepository,
      messagePolicyService,
    );

    const result = await service.resolve(currentUser, dto);

    expect(conversationRepository.findOrderContextById).toHaveBeenCalledWith(
      'order_1',
    );
    expect(messagePolicyService.canResolveConversation).toHaveBeenCalledWith(
      currentUser,
      expect.objectContaining({
        orderId: 'order_1',
      }),
      ConversationType.CUSTOMER_MERCHANT,
    );
    expect(conversationRepository.resolve).toHaveBeenCalledWith({
      orderId: 'order_1',
      type: ConversationType.CUSTOMER_MERCHANT,
      title: 'ORD-00000001 customer_merchant',
      participants: expect.any(Array),
    });
    expect(result).toMatchObject({
      conversationId: 'con_1',
      type: ConversationType.CUSTOMER_MERCHANT,
    });
  });

  it('rejects unavailable rider lane before attempting resolution', async () => {
    const conversationRepository = {
      findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
      resolve: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepository>;
    const service = new ConversationService(
      conversationRepository,
      {} as MessagePolicyService,
    );

    await expect(
      service.resolve(currentUser, {
        orderId: 'order_1',
        type: ConversationTypeValue.customerRider,
      }),
    ).rejects.toBeInstanceOf(AppException);

    expect(conversationRepository.resolve).not.toHaveBeenCalled();
  });

  it('rejects forbidden conversation lanes for the actor', async () => {
    const conversationRepository = {
      findOrderContextById: jest.fn().mockResolvedValue(makeOrderContext()),
      resolve: jest.fn(),
    } as unknown as jest.Mocked<ConversationRepository>;
    const messagePolicyService = {
      canResolveConversation: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<MessagePolicyService>;
    const service = new ConversationService(
      conversationRepository,
      messagePolicyService,
    );

    await expect(service.resolve(currentUser, dto)).rejects.toBeInstanceOf(
      AppException,
    );

    expect(conversationRepository.resolve).not.toHaveBeenCalled();
  });
});
