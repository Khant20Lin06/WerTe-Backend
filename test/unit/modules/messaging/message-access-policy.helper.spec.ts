import {
  ConversationParticipantRole,
  ConversationType,
  MessageAttachmentType,
  MessageType,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ResolvedConversationEntity } from '../../../../src/modules/messaging/entities/resolved-conversation.entity';
import {
  canAccessConversation,
  canModerateConversation,
  canSendAttachment,
  canSendMessage,
  getActiveConversationParticipant,
} from '../../../../src/modules/messaging/policies/message-access-policy.helper';

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
        participantKey: 'user:usr_admin_1',
        userId: 'usr_admin_1',
        roleAtJoin: ConversationParticipantRole.ADMIN,
        canSendMessages: true,
        canSendAttachments: true,
        canSendProofs: false,
        canModerate: true,
        joinedAt: '2026-04-19T10:00:00.000Z',
        leftAt: null,
      },
    ],
    ...overrides,
  };
}

describe('message access policy helper', () => {
  it('returns the active participant record for the authenticated actor', () => {
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

    expect(
      getActiveConversationParticipant({
        currentUser,
        conversation: makeConversation(),
      }),
    ).toMatchObject({
      participantKey: 'user:usr_customer_1',
      roleAtJoin: ConversationParticipantRole.CUSTOMER,
    });
  });

  it('allows proof sends only for participants with proof permission', () => {
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
    const customerUser = makeAuthenticatedUser({
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
    const conversation = makeConversation();

    expect(
      canSendMessage({
        currentUser: merchantUser,
        conversation,
        messageType: MessageType.PROOF_OF_HANDOFF,
      }),
    ).toBe(true);
    expect(
      canSendAttachment({
        currentUser: merchantUser,
        conversation,
        attachmentType: MessageAttachmentType.PROOF_OF_HANDOFF,
      }),
    ).toBe(true);
    expect(
      canSendMessage({
        currentUser: customerUser,
        conversation,
        messageType: MessageType.PROOF_OF_DELIVERY,
      }),
    ).toBe(false);
    expect(
      canSendAttachment({
        currentUser: customerUser,
        conversation,
        attachmentType: MessageAttachmentType.PROOF_OF_DELIVERY,
      }),
    ).toBe(false);
  });

  it('allows moderation only for participants with moderate permission', () => {
    const adminUser = makeAuthenticatedUser({
      userId: 'usr_admin_1',
      role: UserRole.ADMIN,
      actorContext: {
        userId: 'usr_admin_1',
        phone: '0991111111',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    const customerUser = makeAuthenticatedUser({
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
    const conversation = makeConversation();

    expect(
      canAccessConversation({
        currentUser: adminUser,
        conversation,
      }),
    ).toBe(true);
    expect(
      canModerateConversation({
        currentUser: adminUser,
        conversation,
      }),
    ).toBe(true);
    expect(
      canModerateConversation({
        currentUser: customerUser,
        conversation,
      }),
    ).toBe(false);
  });
});
