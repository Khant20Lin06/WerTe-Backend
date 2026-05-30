import {
  ConversationParticipantRole,
  ConversationType,
  OrderStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { makeAuthenticatedUser } from '../../helpers/authenticated-user.factory';
import { ConversationOrderContextEntity } from '../../../../src/modules/messaging/entities/conversation-order-context.entity';
import {
  buildConversationParticipants,
  canResolveConversationForOrder,
} from '../../../../src/modules/messaging/policies/conversation-resolution-policy.helper';
import { createSystemAuthenticatedActor } from '../../../../src/modules/auth/entities/system-authenticated-actor.helper';

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
      merchantName: 'Merchant One',
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

describe('conversation resolution policy helper', () => {
  it('allows customer-owned order chat resolution and includes system participant', () => {
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
    const order = makeOrderContext();

    expect(
      canResolveConversationForOrder({
        currentUser,
        order,
        type: ConversationType.ORDER_CHAT,
      }),
    ).toBe(true);

    expect(
      buildConversationParticipants({
        currentUser,
        order,
        type: ConversationType.ORDER_CHAT,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantKey: 'user:usr_customer_1',
          roleAtJoin: ConversationParticipantRole.CUSTOMER,
        }),
        expect.objectContaining({
          participantKey: 'system:order-chat',
          roleAtJoin: ConversationParticipantRole.SYSTEM,
        }),
      ]),
    );
  });

  it('denies merchant-rider lane when no assigned rider exists', () => {
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
    const order = makeOrderContext({
      rider: null,
    });

    expect(
      canResolveConversationForOrder({
        currentUser,
        order,
        type: ConversationType.MERCHANT_RIDER,
      }),
    ).toBe(false);

    expect(
      buildConversationParticipants({
        currentUser,
        order,
        type: ConversationType.MERCHANT_RIDER,
      }),
    ).toBeNull();
  });

  it('allows support actor to resolve customer operations lane and adds support participant', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_support_1',
      role: UserRole.SUPPORT,
      actorContext: {
        userId: 'usr_support_1',
        phone: '0991111111',
        role: UserRole.SUPPORT,
        status: UserStatus.ACTIVE,
      },
    });
    const order = makeOrderContext();

    expect(
      canResolveConversationForOrder({
        currentUser,
        order,
        type: ConversationType.CUSTOMER_OPERATIONS,
      }),
    ).toBe(true);

    expect(
      buildConversationParticipants({
        currentUser,
        order,
        type: ConversationType.CUSTOMER_OPERATIONS,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantKey: 'user:usr_customer_1',
          roleAtJoin: ConversationParticipantRole.CUSTOMER,
        }),
        expect.objectContaining({
          participantKey: 'user:usr_support_1',
          roleAtJoin: ConversationParticipantRole.SUPPORT,
          canModerate: true,
        }),
      ]),
    );
  });

  it('adds the operations actor into order chat with moderation privileges', () => {
    const currentUser = makeAuthenticatedUser({
      userId: 'usr_support_1',
      role: UserRole.SUPPORT,
      actorContext: {
        userId: 'usr_support_1',
        phone: '0991111111',
        role: UserRole.SUPPORT,
        status: UserStatus.ACTIVE,
      },
    });
    const order = makeOrderContext();

    const participants = buildConversationParticipants({
      currentUser,
      order,
      type: ConversationType.ORDER_CHAT,
    });

    expect(participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantKey: 'system:order-chat',
          roleAtJoin: ConversationParticipantRole.SYSTEM,
        }),
        expect.objectContaining({
          participantKey: 'user:usr_support_1',
          roleAtJoin: ConversationParticipantRole.SUPPORT,
          canModerate: true,
        }),
      ]),
    );
  });

  it('allows system operations actors to resolve order chat without adding a fake user participant', () => {
    const currentUser = createSystemAuthenticatedActor('payment-provider-webhook');
    const order = makeOrderContext();

    expect(
      canResolveConversationForOrder({
        currentUser,
        order,
        type: ConversationType.ORDER_CHAT,
      }),
    ).toBe(true);

    expect(
      buildConversationParticipants({
        currentUser,
        order,
        type: ConversationType.ORDER_CHAT,
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantKey: 'system:order-chat',
          roleAtJoin: ConversationParticipantRole.SYSTEM,
        }),
      ]),
    );
    expect(
      buildConversationParticipants({
        currentUser,
        order,
        type: ConversationType.ORDER_CHAT,
      }),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          participantKey: 'user:system:payment-provider-webhook',
        }),
      ]),
    );
  });
});
