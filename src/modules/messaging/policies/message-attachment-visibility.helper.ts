import {
  ConversationParticipantRole,
  MessageAttachmentVisibility,
} from '@prisma/client';

export function canParticipantViewAttachment(
  role: ConversationParticipantRole,
  visibility: MessageAttachmentVisibility,
): boolean {
  switch (visibility) {
    case MessageAttachmentVisibility.ALL_PARTICIPANTS:
      return true;
    case MessageAttachmentVisibility.OPERATIONS_ONLY:
      return (
        role === ConversationParticipantRole.ADMIN ||
        role === ConversationParticipantRole.SUPPORT
      );
    case MessageAttachmentVisibility.MERCHANT_RIDER_ADMIN:
      return (
        role === ConversationParticipantRole.MERCHANT ||
        role === ConversationParticipantRole.RIDER ||
        role === ConversationParticipantRole.ADMIN ||
        role === ConversationParticipantRole.SUPPORT
      );
    case MessageAttachmentVisibility.RIDER_CUSTOMER_ADMIN:
      return (
        role === ConversationParticipantRole.RIDER ||
        role === ConversationParticipantRole.CUSTOMER ||
        role === ConversationParticipantRole.ADMIN ||
        role === ConversationParticipantRole.SUPPORT
      );
    case MessageAttachmentVisibility.ADMIN_SUPPORT_ONLY:
      return (
        role === ConversationParticipantRole.ADMIN ||
        role === ConversationParticipantRole.SUPPORT
      );
    default:
      return false;
  }
}
