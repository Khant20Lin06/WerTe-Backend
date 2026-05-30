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
import { MessagingPolicyService } from '../../../../src/modules/messaging/services/message-policy.service';

function makeConversation(
  overrides?: Partial<ResolvedConversationEntity>,
): ResolvedConversationEntity {
  return {
    conversationId: 'con_1',
    orderId: 'order_1',
    type: ConversationType.MERCHANT_RIDER,
    title: 'ORD-00000001 merchant_rider',
    lastMessageId: null,
    lastMessageAt: null,
    createdAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-19T10:00:00.000Z',
    participants: [
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
        participantKey: 'user:usr_support_1',
        userId: 'usr_support_1',
        roleAtJoin: ConversationParticipantRole.SUPPORT,
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

describe('MessagingPolicyService', () => {
  const service = new MessagingPolicyService();

  it('returns the active participant for the actor', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_rider_1',
      role: UserRole.RIDER,
      actorContext: {
        userId: 'usr_rider_1',
        phone: '0999999999',
        role: UserRole.RIDER,
        status: UserStatus.ACTIVE,
        riderId: 'rider_1',
      },
    });

    expect(
      service.findActiveParticipant(currentUser, makeConversation()),
    ).toMatchObject({
      participantKey: 'user:usr_rider_1',
      roleAtJoin: ConversationParticipantRole.RIDER,
    });
  });

  it('applies proof and moderation permissions through the service facade', () => {
    const riderUser = makeAuthenticatedUser({
      userId: 'usr_rider_1',
      role: UserRole.RIDER,
      actorContext: {
        userId: 'usr_rider_1',
        phone: '0999999999',
        role: UserRole.RIDER,
        status: UserStatus.ACTIVE,
        riderId: 'rider_1',
      },
    });
    const supportUser = makeAuthenticatedUser({
      userId: 'usr_support_1',
      role: UserRole.SUPPORT,
      actorContext: {
        userId: 'usr_support_1',
        phone: '0991111111',
        role: UserRole.SUPPORT,
        status: UserStatus.ACTIVE,
      },
    });
    const conversation = makeConversation();

    expect(service.canAccessConversation(riderUser, conversation)).toBe(true);
    expect(
      service.canSendMessage(
        riderUser,
        conversation,
        MessageType.PROOF_OF_DELIVERY,
      ),
    ).toBe(true);
    expect(
      service.canSendAttachment(
        supportUser,
        conversation,
        MessageAttachmentType.PROOF_OF_DELIVERY,
      ),
    ).toBe(false);
    expect(service.canModerateConversation(supportUser, conversation)).toBe(
      true,
    );
  });
});
