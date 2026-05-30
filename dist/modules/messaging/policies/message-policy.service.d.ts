import { ConversationType } from '@prisma/client';
import { AuthenticatedUserEntity } from '../../auth/entities/authenticated-user.entity';
import { ConversationOrderContextEntity } from '../entities/conversation-order-context.entity';
import { ConversationParticipantSpec } from './conversation-resolution-policy.helper';
export declare class MessagePolicyService {
    canResolveConversation(currentUser: AuthenticatedUserEntity, order: ConversationOrderContextEntity, type: ConversationType): boolean;
    buildConversationParticipants(currentUser: AuthenticatedUserEntity, order: ConversationOrderContextEntity, type: ConversationType): ConversationParticipantSpec[] | null;
    buildConversationTitle(order: ConversationOrderContextEntity, type: ConversationType): string;
}
