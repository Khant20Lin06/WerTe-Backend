import { MessageAttachmentType, MessageType } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ResolvedConversationEntity, ResolvedConversationParticipantEntity } from '../entities/resolved-conversation.entity';
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
export declare function getActiveConversationParticipant({ currentUser, conversation, }: ConversationPolicyInput): ResolvedConversationParticipantEntity | null;
export declare function canAccessConversation(input: ConversationPolicyInput): boolean;
export declare function canSendMessage({ currentUser, conversation, messageType, }: MessagePolicyInput): boolean;
export declare function canSendAttachment({ currentUser, conversation, attachmentType, }: AttachmentPolicyInput): boolean;
export declare function canModerateConversation(input: ConversationPolicyInput): boolean;
export {};
