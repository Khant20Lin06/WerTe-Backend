import { MessageAttachmentType, MessageType } from '@prisma/client';

import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import {
  ResolvedConversationEntity,
  ResolvedConversationParticipantEntity,
} from '../entities/resolved-conversation.entity';

type ConversationPolicyInput = {
  currentUser: AuthenticatedUserEntity;
  conversation: ResolvedConversationEntity;
};

type MessagePolicyInput = ConversationPolicyInput & {
  messageType: MessageType;
};

type AttachmentPolicyInput = ConversationPolicyInput & {
  attachmentType: MessageAttachmentType;
};

export function getActiveConversationParticipant({
  currentUser,
  conversation,
}: ConversationPolicyInput): ResolvedConversationParticipantEntity | null {
  return (
    conversation.participants.find(
      (participant) =>
        participant.userId === currentUser.userId && participant.leftAt === null,
    ) ?? null
  );
}

export function canAccessConversation(
  input: ConversationPolicyInput,
): boolean {
  return getActiveConversationParticipant(input) !== null;
}

export function canSendMessage({
  currentUser,
  conversation,
  messageType,
}: MessagePolicyInput): boolean {
  const participant = getActiveConversationParticipant({
    currentUser,
    conversation,
  });

  if (participant === null || !participant.canSendMessages) {
    return false;
  }

  if (isProofMessageType(messageType)) {
    return participant.canSendProofs;
  }

  return true;
}

export function canSendAttachment({
  currentUser,
  conversation,
  attachmentType,
}: AttachmentPolicyInput): boolean {
  const participant = getActiveConversationParticipant({
    currentUser,
    conversation,
  });

  if (participant === null || !participant.canSendAttachments) {
    return false;
  }

  if (isProofAttachmentType(attachmentType)) {
    return participant.canSendProofs;
  }

  return true;
}

export function canModerateConversation(
  input: ConversationPolicyInput,
): boolean {
  const participant = getActiveConversationParticipant(input);

  return participant?.canModerate === true;
}

function isProofMessageType(messageType: MessageType): boolean {
  return (
    messageType === MessageType.PROOF_OF_HANDOFF ||
    messageType === MessageType.PROOF_OF_DELIVERY
  );
}

function isProofAttachmentType(attachmentType: MessageAttachmentType): boolean {
  return (
    attachmentType === MessageAttachmentType.PROOF_OF_HANDOFF ||
    attachmentType === MessageAttachmentType.PROOF_OF_DELIVERY
  );
}
