import { MessageAttachmentType, MessageType } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ResolvedConversationEntity } from '../entities/resolved-conversation.entity';
export declare class MessagingPolicyService {
    findActiveParticipant(currentUser: AuthenticatedUserEntity, conversation: ResolvedConversationEntity): import("../entities/resolved-conversation.entity").ResolvedConversationParticipantEntity | null;
    canAccessConversation(currentUser: AuthenticatedUserEntity, conversation: ResolvedConversationEntity): boolean;
    canSendMessage(currentUser: AuthenticatedUserEntity, conversation: ResolvedConversationEntity, messageType?: MessageType): boolean;
    canSendAttachment(currentUser: AuthenticatedUserEntity, conversation: ResolvedConversationEntity, attachmentType: MessageAttachmentType): boolean;
    canModerateConversation(currentUser: AuthenticatedUserEntity, conversation: ResolvedConversationEntity): boolean;
}
