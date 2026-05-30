import {
  ConversationParticipantRole,
  MessageAttachmentVisibility,
} from '@prisma/client';

import { canParticipantViewAttachment } from '../../../../src/modules/messaging/policies/message-attachment-visibility.helper';

describe('message attachment visibility helper', () => {
  it('allows all participants to view public attachments', () => {
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.CUSTOMER,
        MessageAttachmentVisibility.ALL_PARTICIPANTS,
      ),
    ).toBe(true);
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.MERCHANT,
        MessageAttachmentVisibility.ALL_PARTICIPANTS,
      ),
    ).toBe(true);
  });

  it('restricts merchant-rider-admin attachments away from customers', () => {
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.CUSTOMER,
        MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
      ),
    ).toBe(false);
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.RIDER,
        MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
      ),
    ).toBe(true);
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.SUPPORT,
        MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN,
      ),
    ).toBe(true);
  });

  it('restricts admin-support-only attachments to operations roles', () => {
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.ADMIN,
        MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY,
      ),
    ).toBe(true);
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.SUPPORT,
        MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY,
      ),
    ).toBe(true);
    expect(
      canParticipantViewAttachment(
        ConversationParticipantRole.MERCHANT,
        MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY,
      ),
    ).toBe(false);
  });
});
