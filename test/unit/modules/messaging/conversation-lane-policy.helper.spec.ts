import { ConversationType } from '@prisma/client';

import {
  includesSystemParticipant,
  isOperationsConversationType,
  requiresAssignedRiderConversationType,
} from '../../../../src/modules/messaging/policies/conversation-lane-policy.helper';

describe('conversation lane policy helper', () => {
  it('identifies rider-dependent lanes correctly', () => {
    expect(
      requiresAssignedRiderConversationType(ConversationType.ORDER_CHAT),
    ).toBe(true);
    expect(
      requiresAssignedRiderConversationType(
        ConversationType.CUSTOMER_MERCHANT,
      ),
    ).toBe(false);
    expect(
      requiresAssignedRiderConversationType(ConversationType.RIDER_OPERATIONS),
    ).toBe(true);
  });

  it('identifies operations lanes and system-participant lanes', () => {
    expect(
      isOperationsConversationType(ConversationType.MERCHANT_OPERATIONS),
    ).toBe(true);
    expect(
      isOperationsConversationType(ConversationType.MERCHANT_RIDER),
    ).toBe(false);
    expect(includesSystemParticipant(ConversationType.ORDER_CHAT)).toBe(true);
    expect(
      includesSystemParticipant(ConversationType.CUSTOMER_OPERATIONS),
    ).toBe(false);
  });
});
